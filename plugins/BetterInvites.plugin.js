/**
 * @name BetterInvites
 * @author HypedDomi#1711
 * @authorId 354191516979429376
 * @version 1.2.1
 * @description Shows some useful information in the invitation
 * @invite gp2ExK5vc7
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/BetterInvites
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/BetterInvites/BetterInvites.plugin.js
 * @donate https://paypal.me/dominik1711
 * @website https://bambus.me/BetterDiscordStuff/
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: "BetterInvites",
        authors: [
            {
                name: "HypedDomi",
                discord_id: "354191516979429376",
            },
        ],
        version: "1.2.1",
        description:
            "Shows some useful information in the invitation",
        github:
            "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/BetterInvites",
        github_raw:
            "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/BetterInvites/BetterInvites.plugin.js",
    },
    defaultConfig: [
        {
            type: "switch",
            id: "showBanner",
            name: "Show Guild Banner",
            value: true,
        },
        {
            type: "switch",
            id: "showDescription",
            name: "Show Guild Description",
            value: true,
        },
        {
            type: "switch",
            id: "showBoost",
            name: "Show Guild Boost Level",
            value: true,
        },
        {
            type: "switch",
            id: "showInviter",
            name: "Show the User who invited you",
            value: true,
        },
        {
            type: "switch",
            id: "showVerification",
            name: "Show Guild Verification Level",
            value: true,
        },
        {
            type: "switch",
            id: "showNSFW",
            name: "Show Guild NSFW Status",
            value: true,
        },
        {
            type: "switch",
            id: "showExpire",
            name: "Show Invite Expiration",
            value: true,
        },
        {
            type: "switch",
            id: "bigJoinButton",
            name: "Shows a bigger join button",
            value: true,
        },

    ],
    changelog: [
        {
            title: "IMPROVEMENTS",
            type: "improved",
            items: ["Boost level should now display the correct level"],
        }
    ],
};

module.exports = !global.ZeresPluginLibrary
    ? class {
        constructor() {
            this._config = config;
        }

        load() {
            BdApi.showConfirmationModal(
                "Library plugin is needed",
                `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
                {
                    confirmText: "Download",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        request.get(
                            "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                            (error, response, body) => {
                                if (error)
                                    return electron.shell.openExternal(
                                        "https://betterdiscord.app/Download?id=9"
                                    );

                                fs.writeFileSync(
                                    path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
                                    body
                                );
                            }
                        );
                    },
                }
            );
        }
        start() {
            this.load();
        }
        stop() { }
    }
    : (([Plugin, Library]) => {
        const { Patcher, DiscordModules, PluginUtilities } = Library;
        const { React } = DiscordModules;
        const Invite = BdApi.findModule(m => m.default?.displayName === "GuildInvite");
        const TooltipContainer = BdApi.findModuleByProps('TooltipContainer').TooltipContainer;
        class BetterInvites extends Plugin {
            constructor() {
                super();
                this.getSettingsPanel = () => {
                    return this.buildSettingsPanel().getElement();
                };
            }
            onStart() {
                this.patchInvite();
                PluginUtilities.addStyle(this.getName(), ".content-1r-J1r { flex-wrap: wrap; }");
            }

            patchInvite() {
                Patcher.after(Invite, "default", (_, [props], component) => {
                    const { invite } = props;
                    if (!invite) return;
                    const { guild, inviter } = invite;

                    if (this.settings.showBanner && guild?.banner) {
                        component.props.children.splice(1, 0,
                            React.createElement("div", { className: `${config.info.name}-guildBanner`, style: { position: "relative", marginBottom: "1%" } },
                                React.createElement("img", {
                                    src: `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=1024`,
                                    style: { width: "100%", height: "auto", maxHeight: "100px", borderRadius: "5px", objectFit: "cover" }
                                })
                            )
                        )
                    }

                    const boostLevel = component.props.children[this.settings.showBanner && guild?.banner ? 2 : 1].props.children[0].props.guild?.premiumTier;

                    let expireTooltip = "";
                    if (invite.expires_at != null) {
                        const inviteExpireDays = Math.floor((new Date(invite.expires_at) - Date.now()) / 1000 / 60 / 60 / 24);
                        const inviteExpireHours = Math.floor((new Date(invite.expires_at) - Date.now()) / 1000 / 60 / 60);
                        const inviteExpireMinutes = Math.floor((new Date(invite.expires_at) - Date.now()) / 1000 / 60);

                        if (inviteExpireDays > 0) {
                            inviteExpireDays === 1 ? expireTooltip = `${inviteExpireDays} day` : expireTooltip = `${inviteExpireDays} days`;
                        } else if (inviteExpireHours > 0) {
                            inviteExpireHours === 1 ? expireTooltip = `${inviteExpireHours} hour` : expireTooltip = `${inviteExpireHours} hours`;
                        } else {
                            inviteExpireMinutes === 1 ? expireTooltip = `${inviteExpireMinutes} minute` : expireTooltip = `${inviteExpireMinutes} minutes`;
                        }
                    }

                    component.props.children[this.settings.showBanner && guild?.banner ? 2 : 1].props.children.splice(2, 0,
                        this.settings.showBoost || this.settings.showInviter || this.settings.showVerification || this.settings.showNSFW || this.settings.showExpire ?
                            React.createElement("div", { className: `${config.info.name}-iconWrapper`, style: { display: "grid", grid: "auto / auto auto", direction: "rtl", "grid-gap": "3px" } },
                                // Boost
                                this.settings.showBoost && boostLevel > 0 ?
                                    React.createElement(TooltipContainer, { text: `Boost Level ${boostLevel}` },
                                        React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/4a2618502278029ce88adeea179ed435.svg" }))
                                    : null,
                                // Inviter
                                this.settings.showInviter && inviter ?
                                    React.createElement(TooltipContainer, { text: `Invited by: ${inviter?.username}#${inviter?.discriminator}` },
                                        React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: `https://cdn.discordapp.com/avatars/${inviter?.id}/${inviter?.avatar}.png?size=1024`, onError: (e) => { e.target.src = "https://cdn.discordapp.com/embed/avatars/0.png"; } }))
                                    : null,
                                // Verification
                                this.settings.showVerification && guild?.verification_level > 0 ?
                                    React.createElement(TooltipContainer, { text: `Verification Level ${guild?.verification_level}` },
                                        React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/e62b930d873735bbede7ae1785d13233.svg" }))
                                    : null,
                                // NSFW
                                this.settings.showNSFW && guild?.nsfw_level > 0 ?
                                    React.createElement(TooltipContainer, { text: `NSFW Level ${guild?.nsfw_level}` },
                                        React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/ece853d6c1c1cd81f762db6c26fade40.svg" }))
                                    : null,
                                // Invite Expiration
                                this.settings.showExpire && invite.expires_at != null ?
                                    React.createElement(TooltipContainer, { text: `Expires in: ${expireTooltip}` },
                                        React.createElement("img", { style: { height: "28px", borderRadius: "5px", objectFit: "contain" }, src: "https://discord.com/assets/630f5938948131784285d97d57a3e8a0.svg" }))
                                    : null,
                            ) : null
                    );

                    const contentDiv = component.props.children[this.settings.showBanner && guild?.banner ? 2 : 1];

                    if (this.settings.showDescription && guild?.description) {
                        // Description
                        contentDiv.props.children.push(
                            React.createElement("div", { className: `${config.info.name}-guildDescription`, style: { marginTop: "1%" } },
                                React.createElement("div", { className: "markup-eYLPri" }, guild.description)
                            )
                        );
                    }

                    if (this.settings.bigJoinButton) {
                        const joinButton = contentDiv.props.children[3];
                        contentDiv.props.children.splice(3, 1);
                        joinButton.props.style = {
                            width: "100%",
                            margin: "3% 0 0 0"
                        };
                        contentDiv.props.children.push(joinButton);
                    }
                });
            }

            onStop() {
                Patcher.unpatchAll();
                PluginUtilities.removeStyle(this.getName());
            }
        }
        return BetterInvites;
    })(global.ZeresPluginLibrary.buildPlugin(config));