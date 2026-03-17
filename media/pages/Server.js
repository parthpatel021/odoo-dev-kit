import { Input } from "../components/input.js";
import { Accordion } from "../components/accordion.js";
import { cliOptions } from "../utils/cli-options.js";

const { Component, xml, useState, useEffect } = owl;

export class Server extends Component {
    static components = { Input, Accordion };

    setup() {
        this._dbRequestId = 0;
        this._lastAddonPath = "";
        this.cliOptions = cliOptions;

        const savedState = this.props.vscode.getState() || {};

        this.state = useState({
            config: {
                addons: [{ id: 1, name: "", path: "", versionChange: false, enabled: true }],
                cliOptions: {},
                pythonVenv: "",
                odooBinPath: "",
                autoDetectDbName: true,
                ...(savedState.config || {}),
            },
            params: savedState.params || {},
            runMode: "update",
            isRunning: false,
        });

        useEffect(
            () => {
                const prev = this.props.vscode.getState() || {};
                const next = {
                    ...prev,
                    params: this.state.params,
                    config: this.state.config,
                };
                const plain = JSON.parse(JSON.stringify(next));
                this.props.vscode.setState(plain);
                this.props.vscode.postMessage({
                    command: "persistState",
                    state: plain,
                });
            },
            () => [JSON.stringify(this.state.params), JSON.stringify(this.state.config)]
        );

        useEffect(
            () => {
                const handler = event => {
                    const message = event.data;
                    if (message?.command === "serverStatus") {
                        this.state.isRunning = !!message.running;
                    }
                    if (message?.command === "resolvedDbName") {
                        if (message.requestId !== this._dbRequestId) {
                            return;
                        }
                        const currentDb = (this.state.params.database || "").trim();
                        if (currentDb) {
                            return;
                        }
                        if (message.dbName) {
                            this.state.params.database = message.dbName;
                        }
                    }
                };
                window.addEventListener("message", handler);
                return () => window.removeEventListener("message", handler);
            },
            () => []
        );

        useEffect(
            () => {
                if (this.state.config.autoDetectDbName === false) {
                    return;
                }
                const currentDb = (this.state.params.database || "").trim();
                if (currentDb) {
                    return;
                }
                const addonPath = this.getFirstAddonPath();
                if (!addonPath) {
                    return;
                }
                if (addonPath === this._lastAddonPath) {
                    return;
                }
                this._lastAddonPath = addonPath;
                const requestId = ++this._dbRequestId;
                this.props.vscode.postMessage({
                    command: "resolveDbNameFromAddon",
                    addonPath,
                    requestId,
                });
            },
            () => [JSON.stringify(this.state.config.addons), (this.state.params.database || "").trim()]
        );
    }

    getFirstAddonPath() {
        const addons = this.state.config.addons || [];
        for (const addon of addons) {
            const path = (addon.path || "").trim();
            if (path) {
                return path;
            }
        }
        return "";
    }

    getEnabledOptions(group) {
        const enabled = this.state.config.cliOptions?.[group.groupName] || {};
        return group.options.filter(opt => enabled[opt.name]);
    }

    getValue(option) {
        return this.state.params[option.name] ?? (option.type === "boolean" ? false : "");
    }

    updateParam(option, value) {
        this.state.params[option.name] = value;
    }

    toggleAddonEnabled(addon, value) {
        const record = this.state.config.addons.find(a => a.id === addon.id);
        if (record) {
            record.enabled = !!value;
        }
    }

    getValidAddons() {
        return (this.state.config.addons || []).filter(
            addon => (addon.path || "").trim() !== ""
        );
    }

    getEnabledAddons() {
        return this.getValidAddons().filter(addon => addon.enabled !== false);
    }

    formatValue(value) {
        const str = String(value);
        if (/[\s"]/g.test(str)) {
            return `"${str.replace(/"/g, '\\"')}"`;
        }
        return str;
    }

    getEnabledOptionsList() {
        const enabledByGroup = this.state.config.cliOptions || {};
        return this.cliOptions.flatMap(group => {
            const enabled = enabledByGroup[group.groupName] || {};
            return group.options.filter(opt => enabled[opt.name]);
        });
    }

    getCommandArgs() {
        const args = [];
        const enabledOptions = this.getEnabledOptionsList();
        const runMode = this.state.runMode || "update";

        for (const opt of enabledOptions) {
            if (opt.name === "addons-path") {
                continue;
            }
            if (opt.name === "init" || opt.name === "update") {
                continue;
            }
            const value = this.state.params[opt.name];
            if (opt.type === "boolean") {
                if (value === true) {
                    args.push(opt.key);
                }
                continue;
            }
            if (value === undefined || value === null || value === "") {
                continue;
            }
            args.push(opt.key, this.formatValue(value));
        }

        const initOpt = enabledOptions.find(opt => opt.name === "init");
        const updateOpt = enabledOptions.find(opt => opt.name === "update");
        if (runMode === "init" && initOpt) {
            const initValue = this.state.params[initOpt.name];
            if (initValue !== undefined && initValue !== null && initValue !== "") {
                args.push(initOpt.key, this.formatValue(initValue));
            }
        }
        if (runMode !== "init" && updateOpt) {
            const updateValue = this.state.params[updateOpt.name];
            if (updateValue !== undefined && updateValue !== null && updateValue !== "") {
                args.push(updateOpt.key, this.formatValue(updateValue));
            }
        }

        const addonsParam = (this.state.params["addons-path"] || "").trim();
        let addonsValue = addonsParam;
        if (!addonsValue) {
            const paths = this.getEnabledAddons()
                .map(addon => (addon.path || "").trim())
                .filter(Boolean);
            if (paths.length) {
                addonsValue = paths.join(",");
            }
        }
        if (addonsValue) {
            args.push("--addons-path", this.formatValue(addonsValue));
        }

        return args;
    }

    getBaseCommandParts() {
        const venv = (this.state.config.pythonVenv || "").trim();
        const odooBin = (this.state.config.odooBinPath || "").trim() || "odoo-bin";
        const parts = [];
        if (venv) {
            const pythonPath = `${venv.replace(/\/+$/, "")}/bin/python`;
            parts.push(this.formatValue(pythonPath));
        }
        parts.push(this.formatValue(odooBin));
        return parts;
    }

    getRunCommand() {
        return [...this.getBaseCommandParts(), ...this.getCommandArgs()].join(" ");
    }

    validateRunConfiguration() {
        const errors = [];
        const enabledAddons = this.getEnabledAddons();
        const enabledAddonPaths = enabledAddons.map(addon => (addon.path || "").trim());
        const invalidAddonPaths = enabledAddonPaths.filter(path => path.length < 3);
        const addonsParam = (this.state.params["addons-path"] || "").trim();
        if (!addonsParam && enabledAddonPaths.length === 0) {
            errors.push("Add at least one enabled addon path or set --addons-path.");
        }
        if (invalidAddonPaths.length) {
            errors.push("Some enabled addon paths look invalid.");
        }
        const venv = (this.state.config.pythonVenv || "").trim();
        if (venv && venv.length < 3) {
            errors.push("Python venv path looks too short.");
        }
        const odooBin = (this.state.config.odooBinPath || "").trim();
        if (odooBin && odooBin.length < 3) {
            errors.push("Odoo bin path looks too short.");
        }
        if (addonsParam && addonsParam.length < 3) {
            errors.push("--addons-path looks too short.");
        }
        return errors;
    }

    getDropDbCommand() {
        const dbName = (this.state.params.database || "").trim();
        if (!dbName) {
            return "";
        }
        return `dropdb ${this.formatValue(dbName)}`;
    }

    async copyRunCommand() {
        const command = this.getRunCommand();
        if (!command) {
            this.props.vscode.postMessage({
                command: "showMessage",
                text: "No command to copy. Configure options first.",
            });
            return;
        }
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(command);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = command;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            this.props.vscode.postMessage({
                command: "showMessage",
                text: "Run command copied to clipboard.",
            });
        } catch {
            this.props.vscode.postMessage({
                command: "showMessage",
                text: "Failed to copy command.",
            });
        }
    }

    async runServer() {
        const validationErrors = this.validateRunConfiguration();
        if (validationErrors.length) {
            this.props.vscode.postMessage({
                command: "showWarning",
                text: `Cannot run server: ${validationErrors.join(" ")}`,
            });
            return;
        }
        this.state.runMode = "update";
        const command = this.getRunCommand();
        if (!command) {
            this.props.vscode.postMessage({
                command: "showMessage",
                text: "No command to run. Configure options first.",
            });
            return;
        }
        this.props.vscode.postMessage({
            command: "runCommand",
            text: command,
        });
        this.state.isRunning = true;
    }

    async dropDbAndRun() {
        const validationErrors = this.validateRunConfiguration();
        if (validationErrors.length) {
            this.props.vscode.postMessage({
                command: "showWarning",
                text: `Cannot run server: ${validationErrors.join(" ")}`,
            });
            return;
        }
        const dbName = (this.state.params.database || "").trim();
        if (!dbName) {
            this.props.vscode.postMessage({
                command: "showWarning",
                text: "Set a database name first.",
            });
            return;
        }
        this.state.runMode = "init";
        const runCommand = this.getRunCommand();
        const dropCommand = this.getDropDbCommand();
        if (!runCommand || !dropCommand) {
            this.props.vscode.postMessage({
                command: "showMessage",
                text: "No command to run. Configure options first.",
            });
            return;
        }
        this.props.vscode.postMessage({
            command: "runCommand",
            text: `${dropCommand} && ${runCommand}`,
        });
        this.state.isRunning = true;
    }

    async stopServer() {
        this.props.vscode.postMessage({
            command: "stopServer",
        });
        this.state.isRunning = false;
    }

    async dropDb() {
        const command = this.getDropDbCommand();
        const dbName = (this.state.params.database || "").trim();
        if (!command) {
            this.props.vscode.postMessage({
                command: "showWarning",
                text: "Set a database name first.",
            });
            return;
        }
        this.props.vscode.postMessage({
            command: "runDropDb",
            text: command,
            dbName,
        });
    }

    hasAnyEnabledCliOption() {
        const groups = Object.values(this.state.config.cliOptions || {});
        return groups.some(group =>
            Object.values(group || {}).some(Boolean)
        );
    }

    hasConfiguration() {
        const hasAddons = this.getValidAddons().length > 0;
        const hasCli = this.hasAnyEnabledCliOption();
        const hasEnv = (this.state.config.pythonVenv || "").trim() !== "" ||
            (this.state.config.odooBinPath || "").trim() !== "";
        return hasAddons || hasCli || hasEnv;
    }

    getInputTypeForOption(option) {
        const inputOptionTypeMap = {
            boolean: "checkbox",
            text: "text",
            number: "text",
            list: "text",
        };
        return inputOptionTypeMap[option.type] || "text";
    }

    static template = xml`
        <div class="server-container">
            <div class="main-title">Server Parameters</div>

            <div class="section-title">Actions</div>
            <div class="action-buttons">
                <button class="icon-btn primary-btn" t-on-click="runServer" title="Run server">
                    <i class="codicon codicon-debug-start"/>
                </button>
                <button class="icon-btn danger-btn" t-on-click="dropDbAndRun" title="Drop DB and run server">
                    <i class="codicon codicon-debug-restart"/>
                </button>
                <div class="action-right">
                    <button
                        t-att-class="state.isRunning ? 'icon-btn stop-btn active' : 'icon-btn stop-btn'"
                        t-att-disabled="!state.isRunning"
                        t-on-click="stopServer"
                        title="Stop server"
                    >
                        <i class="codicon codicon-debug-stop"/>
                    </button>
                    <span
                        t-att-class="state.isRunning ? 'running-indicator active' : 'running-indicator'"
                        title="Server running"
                    />
                </div>
            </div>

            <t t-if="!this.hasConfiguration()">
                <div class="empty-state">
                    No configuration found. Configure your environment, addons, or CLI options first.
                </div>
            </t>

            <t t-set="validAddons" t-value="this.getValidAddons()"/>
            <t t-if="validAddons.length">
                <div class="section-title">Configured Addons</div>
                <div class="options-grid">
                    <t t-foreach="validAddons" t-as="addon" t-key="addon.id">
                        <div class="option-card" t-att-title="addon.path || addon.name || ''">
                            <Input
                                type="'checkbox'"
                                value="addon.enabled !== false"
                                onChange="(val) => this.toggleAddonEnabled(addon, val)"
                            />
                            <span class="option-label" t-out="addon.name || addon.path || 'Unnamed addon'"/>
                        </div>
                    </t>
                </div>
            </t>

            <t t-foreach="cliOptions" t-as="group" t-key="group.groupName">
                <t t-set="options" t-value="this.getEnabledOptions(group)" />

                <div t-if="options.length" class="cli-group">
                    <div class="section-title" t-out="group.groupName"/>

                    <div class="options-list">
                        <div
                            t-foreach="options"
                            t-as="option"
                            t-key="option.name"
                            class="option-row"
                            t-att-title="option.description"
                        >
                            <div class="cli-key">
                                <span t-out="option.key"/>
                            </div>

                            <div class="cli-input">
                                <Input
                                    type="getInputTypeForOption(option)"
                                    value="this.getValue(option)"
                                    placeholder="option.name"
                                    onChange="(val) => this.updateParam(option, val)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </t>

            <t t-if="this.hasConfiguration()">
                <div class="run-command-section">
                    <Accordion title="'Run Command'">
                        <div class="command-wrap">
                            <pre class="command-box" t-out="this.getRunCommand()"/>
                            <button class="copy-btn" t-on-click="copyRunCommand" title="Copy command">
                                <i class="codicon codicon-copy"/>
                            </button>
                        </div>
                    </Accordion>
                </div>
            </t>
        </div>
    `;
}
