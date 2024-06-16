declare module "dbd-soft-ui" {
    import { Express, Request, Response } from "express";

    type themeConfig = {
        customThemeOptions: {
            index: ({ req, res, config }: {
                req: Request,
                res: Response,
                config: any
            }) => Promise<{
                cards: {
                    icon: string,
                    getValue?: string,
                    progressBar?: {
                        enabled: boolean,
                        getProgress: number
                    }
                }[],
                graph: {
                    values: number[],
                    labels: string[]
                }
            }>,
        },
        addons: string[],
        websiteName: string,
        colorScheme: "dark" | "pink" | "blue" | "red" | "green" | "yellow" | "custom",
        themeColors?: {
            primaryColor: string,
            secondaryColor: string
        }
        supporteMail: string,
        locales: Record<string, any>,
        footer: {
            replaceDefault: boolean,
            text: string,
        }
        admin: {
            pterodactyl: {
                enabled: boolean,
                apiKey: string,
                panelLink: string,
                serverUUIDs: string[]
            },
            logs?: {
                enabled?: boolean,
                key?: string,
            }
        },
        icons: {
            favicon: string,
            noGuildIcon: string,
            sidebar: {
                darkUrl: string,
                lightUrl: string,
                hideName: boolean,
                borderRadius: boolean,
                alignCenter: boolean
            }
        },
        index: {
            graph: {
                enabled: boolean,
                lineGraph: boolean,
                tag: string,
                max: number
            }
        },
        premium: {
            enabled: boolean,
            card: {
                title: string,
                description: string,
                bgImage: string,
                button: {
                    text: string,
                    url: string
                }
            }
        },
        preloader: {
            image: string,
            spinner: boolean,
            text: string
        },
        sidebar?: {
            gestures: {
                disabled: boolean,
                gestureTimer: number,
                gestureSensitivity: number
            }
        },
        shardspage?: {
            enabled: boolean,
            key: string,
        },
        meta: {
            author: string,
            owner: string,
            description: string,
            ogLocale: string,
            ogTitle: string,
            ogImage: string,
            ogType: string,
            ogUrl: string,
            ogSiteName: string,
            ogDescription: string,
            twitterTitle: string,
            twitterDescription: string,
            twitterDomain: string,
            twitterUrl: string,
            twitterCard: string,
            twitterSite: string,
            twitterSiteId: string,
            twitterCreator: string,
            twitterCreatorId: string,
            twitterImage: string
        },
        error: {
            error404: {
                title: string,
                subtitle: string,
                description: string
            },
            dbdError: {
                disableSecretMenu: boolean,
                secretMenuCombination: string[]
            }
        },
        sweetalert: {
            errors: {
                requirePremium: string
            },
            success: {
                login: string
            }
        },
        blacklisted: {
            title: string,
            subtitle: string,
            description: string,
            button: {
                enabled: boolean,
                text: string,
                link: string
            }
        },
        commands?: [
            {
                category: string,
                subTitle: string,
                categoryId: string,
                image: string,
                hideAlias: boolean,
                hideDescription: boolean,
                hideSidebarItem: boolean,
                list: [
                    {
                        commandName: string,
                        commandUsage: string,
                        commandDescription: string,
                        commandAlias: string
                    }
                ]
            }
        ]

    }

    export default function (options: themeConfig): {
        themeCodename: string,
        viewsPath: string,
        staticPath: string,
        embedBuilderComponent: string,
        themeConfig: themeConfig,
        init: (app: Express, config: Record<string, any>) => void;
    };

    export const partials: any;
    export const formTypes: FormTypes;
    export const cmdHandler: (commands: Record<string, any>[], prefix: string) => Record<string, any>[];

    /**
     * @see [utils/feedHandler](./utils/feedHandler.js).
     */
    export class Feed {
        color: FeedColor;
        description: string;
        icon: FeedIcon;
        id: string | number;

        setColor: (color: FeedColor) => Feed;
        setDescription: (description: string) => Feed;
        setIcon: (icon: FeedIcon) => Feed;
        getFeed: (id: string | number) => Feed;
        delete: () => Feed;
        send: () => Promise<void>;
        constructor();
    }

    /**
     * All possible colors that can be used against the
     * `Feed#setColor()` method. They can be accessed with
     * dot notation, eg `FeedColor.Red`.
     */
    export enum FeedColor {
        Red = "red",
        Orange = "orange",
        Pink = "pink",
        Gray = "gray",
        Green = "green",
        Blue = "blue",
        Dark = "dark"
    }

    /**
     * All possible icons that can be used against the
     * `Feed#setIcon()` method. They can be accessed with
     * bracket notation, eg `FeedIcon["address-book"]`.
     */
    export enum FeedIcon {
        "address-book",
        "address-card",
        "adjust",
        "air-freshener",
        "align-center",
        "align-left",
        "align-right",
        "ambulance",
        "angle-double-down",
        "angle-double-left",
        "angle-double-right",
        "angle-double-up",
        "angle-down",
        "angle-left",
        "angle-right",
        "angle-up",
        "archive",
        "arrow-alt-circle-down",
        "arrow-alt-circle-left",
        "arrow-alt-circle-right",
        "arrow-alt-circle-up",
        "arrow-down",
        "arrow-left",
        "arrow-right",
        "arrow-up",
        "arrows-alt",
        "arrows-alt-h",
        "arrows-alt-v",
        "assistive-listening-systems",
        "asterisk",
        "at",
        "atlas",
        "award",
        "backspace",
        "backward",
        "bahai",
        "ban",
        "band-aid",
        "bars",
        "battery-empty",
        "battery-full",
        "battery-half",
        "battery-quarter",
        "battery-three-quarters",
        "bed",
        "beer",
        "bell",
        "bell-slash",
        "birthday-cake",
        "bolt",
        "bomb",
        "bone",
        "book",
        "book-dead",
        "book-medical",
        "book-open",
        "bookmark",
        "border-all",
        "border-none",
        "border-style",
        "bowling-ball",
        "box",
        "box-open",
        "briefcase",
        "broadcast-tower",
        "bug",
        "building",
        "bullhorn",
        "calculator",
        "calendar",
        "calendar-alt",
        "calendar-check",
        "calendar-day",
        "calendar-minus",
        "calendar-plus",
        "calendar-times",
        "calendar-week",
        "camera",
        "caret-down",
        "caret-left",
        "caret-right",
        "caret-up",
        "certificate",
        "chair",
        "chalkboard",
        "charging-station",
        "chart-bar",
        "chart-line",
        "chart-pie",
        "check",
        "check-circle",
        "check-square",
        "circle",
        "circle-notch",
        "clipboard",
        "clock",
        "clone",
        "cloud",
        "cloud-download-alt",
        "cloud-meatball",
        "cloud-moon",
        "cloud-moon-rain",
        "cloud-rain",
        "cloud-showers-heavy",
        "cloud-sun",
        "cloud-sun-rain",
        "cloud-upload-alt",
        "code",
        "code-branch",
        "cog",
        "cogs",
        "columns",
        "comment",
        "comment-alt",
        "comment-dollar",
        "comment-dots",
        "comment-medical",
        "comment-slash",
        "comments",
        "comments-dollar",
        "compact-disc",
        "compass",
        "compress-alt",
        "cookie",
        "cookie-bite",
        "copy",
        "credit-card",
        "crop",
        "crop-alt",
        "cut",
        "database",
        "desktop",
        "edit",
        "envelope",
        "envelope-open",
        "eraser",
        "ethernet",
        "exchange-alt",
        "exclamation",
        "exclamation-circle",
        "exclamation-triangle",
        "expand",
        "expand-alt",
        "external-link-alt",
        "eye",
        "eye-dropper",
        "eye-slash",
        "fan",
        "file",
        "file-alt",
        "file-archive",
        "file-audio",
        "file-code",
        "file-download",
        "fill",
        "fill-drip",
        "filter",
        "fingerprint",
        "fire",
        "fire-alt",
        "folder",
        "folder-open",
        "forward",
        "gamepad",
        "ghost",
        "gift",
        "gifts",
        "globe",
        "globe-africa",
        "globe-asia",
        "globe-europe",
        "headphones",
        "headphones-alt",
        "headset",
        "heart",
        "heart-broken",
        "heartbeat",
        "history",
        "home",
        "info",
        "keyboard",
        "layer-group",
        "list",
        "lock",
        "lock-open",
        "map-marker",
        "map-marker-alt",
        "microphone",
        "microphone-alt",
        "microphone-alt-slash",
        "minus",
        "mobile",
        "mobile-alt",
        "moon",
        "mouse",
        "mouse-pointer",
        "music",
        "network-wired",
        "neuter",
        "paperclip",
        "paste",
        "pause",
        "paw",
        "pen",
        "pencil-alt",
        "percent",
        "percentage",
        "phone",
        "phone-alt",
        "phone-slash",
        "phone-volume",
        "photo-video",
        "power-off",
        "question",
        "question-circle",
        "redo",
        "redo-alt",
        "reply",
        "robot",
        "rocket",
        "rss",
        "satellite-dish",
        "save",
        "search",
        "server",
        "shapes",
        "share",
        "share-alt",
        "shield-alt",
        "signal",
        "skull",
        "skull-crossbones",
        "sliders-h",
        "sort",
        "spinner",
        "times",
        "times-circle",
        "toggle-off",
        "toggle-on",
        "toolbox",
        "tools",
        "trash",
        "trash-alt",
        "tv",
        "undo",
        "undo-alt",
        "unlink",
        "unlock",
        "unlock-alt",
        "upload",
        "user",
        "user-alt",
        "volume-down",
        "volume-mute",
        "volume-off",
        "volume-up",
        "wifi",
        "wrench",

        "youtube",
        "discord",
        "node",
        "apple",
        "sellsy",
        "app-store",
        "cloudflare",
        "dev",
        "github-alt",
        "gitlab",
        "google",
        "itunes-note",
        "node-js",
        "npm",
        "spotify",
        "usb",
        "windows"
    }

    /**
     * @see [utils/formtypes](./utils/formtypes.js).
     */
    export interface FormTypes {
        spacer: (themeOptions: Record<string, any>) => {
            type: string,
            themeOptions: Record<string, any>
        }
        emojiPicker: (disabled: boolean, themeOptions: Record<string, any>) => {
            type: string,
            disabled: boolean,
            themeOptions: Record<string, any>
        }
        slider: (min: number, max: number, step: number, disabled: boolean, themeOptions: Record<string, any>) => {
            type: string,
            min: number,
            max: number,
            step: number,
            disabled: boolean,
            themeOptions: Record<string, any>
        },
        date: (disabled: boolean, themeOptions: Record<string, any>) => {
            type: string,
            disabled: boolean,
            themeOptions: Record<string, any>
        },
        numberPicker: (min: number, max: number, disabled: boolean, themeOptions: Record<string, any>) => {
            type: string,
            disabled: boolean,
            themeOptions: Record<string, any>
        },
        tagInput: (disabled: boolean, themeOptions: Record<string, any>) => {
            type: string,
            disabled: boolean,
            themeOptions: Record<string, any>
        }
    }
}
