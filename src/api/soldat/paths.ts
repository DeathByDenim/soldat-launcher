import path from "path";
import { isProduction } from "src/environment";
import { ipcRenderer } from "electron";

const soldatPaths = {
    clientDirectory: isProduction ? path.resolve(process.resourcesPath, "soldat") : "./soldat",
    serverDirectory: isProduction ? path.resolve(process.resourcesPath, "soldat") : "./soldat",

    get appDataDirectory(): Promise<string> {
        return ipcRenderer.invoke('getAppDataPath');
    },

    get clientExecutable(): string {
        let clientExecutableFilename = "opensoldat";
        if (process.platform === "win32") {
            clientExecutableFilename += ".exe";
        }
        return path.join(this.clientDirectory, clientExecutableFilename);
    },

    get clientConfigsDirectory(): Promise<string> {
        return ipcRenderer.invoke('getAppDataPath').then((d: string) => {
            return path.join(d, "configs");
        });
    },

    get clientConfigFile(): Promise<string> {
        return this.clientConfigsDirectory.then((d: string) => {
            return path.join(d, "client.cfg");
        });
    },

    get clientControlsConfigFile(): Promise<string> {
        return this.clientConfigsDirectory.then((d: string) => {
            return path.join(d, "controls.cfg");
        });
    },

    get clientCustomBindingsConfigFile(): Promise<string> {
        return this.clientConfigsDirectory.then((d: string) => {
            return path.join(d, "bindings.cfg");
        });
    },

    get clientGameConfigFile(): Promise<string> {
        return this.clientConfigsDirectory.then((d: string) => {
            return path.join(d, "game.cfg");
        });
    },

    get clientGraphicsConfigFile(): Promise<string> {
        return this.clientConfigsDirectory.then((d: string) => {
            return path.join(d, "graphics.cfg");
        });
    },

    get clientPlayerConfigFile(): Promise<string> {
        return this.clientConfigsDirectory.then((d: string) => {
            return path.join(d, "player.cfg");
        });
    },

    get clientSoundConfigFile(): Promise<string> {
        return this.clientConfigsDirectory.then((d: string) => {
            return path.join(d, "sound.cfg");
        });
    },

    get customInterfacesDirectory(): Promise<string> {
        return ipcRenderer.invoke('getAppDataPath').then((d: string) => {
            return path.join(d, "custom-interfaces");
        });
    },

    get demosDirectory(): Promise<string> {
        return ipcRenderer.invoke('getAppDataPath').then((d: string) => {
            return path.join(d, "demos");
        });
    },

    get mapsDirectory(): string {
        // We only list maps in server's directory (in case server and client aren't in same folder).
        return path.join(this.serverDirectory, "maps");
    },

    get modsDirectory(): string {
        return path.join(this.serverDirectory, "mods");
    },

    get serverConfigsDirectory(): Promise<string> {
        return ipcRenderer.invoke('getAppDataPath').then((d: string) => {
            return path.join(d, "configs");
        });
    },

    get serverConfigFile(): Promise<string> {
        return this.serverConfigsDirectory.then((d: string) => {
            return path.join(d, "server.cfg");
        });
    },

    get serverExecutable(): string {
        let serverExecutableFilename = "opensoldatserver";
        if (process.platform === "win32") {
            serverExecutableFilename += ".exe";
        }

        return path.join(this.serverDirectory, serverExecutableFilename);
    },

    get serverMapsList(): Promise<string> {
        return this.serverConfigsDirectory.then((d: string) => {
            return path.join(d, "mapslist.txt");
        });
    }
};

export { soldatPaths };
