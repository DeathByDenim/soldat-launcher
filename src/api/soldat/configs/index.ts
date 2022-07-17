import fs from "fs";
import { soldatPaths } from "../paths";
import { ControlsConfig, GameConfig, GraphicsConfig, PlayerConfig, ServerConfig, SoundConfig } from "./types";
import { configToFileData, parseConfigFileData, SoldatConfig } from "./parser";
import ControlsSettings from "src/settings/client/controls";
import CustomBindings from "src/settings/client/customBindings";
import GameSettings from "src/settings/client/game";
import GraphicsSettings from "src/settings/client/graphics";
import PlayerSettings from "src/settings/client/player";
import SoundSettings from "src/settings/client/sound";

const loadConfig = <T extends SoldatConfig>(configFilePath: string): Promise<T> => {
    return fs.promises.readFile(configFilePath, { encoding: "utf8" })
        .then(fileData => {
            return parseConfigFileData(fileData) as T;
        })
        .catch((error) => {
            console.warn("An error occurred when reading a config file: ", error);
            return null;
        });
}

/* Soldat unpacks its configs automatically, but we need to handle this scenario
 * if user wants to save some settings before launching Soldat for the first time.
 * Before creating the configs directories, we make sure Soldat's executables
 * are in place, so that we don't end up writing configs to random places on disk if
 * paths are not configured properly. */
const makeConfigsFolders = (): Promise<void> => {
    const checkClientExe = fs.promises.stat(soldatPaths.clientExecutable);
    const checkServerExe = fs.promises.stat(soldatPaths.serverExecutable);

    return Promise.all([checkClientExe, checkServerExe])
        .catch(() => {
            return Promise.reject(
                Error("Soldat was not found in target directory, skipping configs folder creation.")
            )
        })
        .then(() => {
            const makeClientConfigFolder = fs.promises.mkdir(
                soldatPaths.clientConfigsDirectory, { recursive: true }
            );
            const makeServerConfigFolder = fs.promises.mkdir(
                soldatPaths.serverConfigsDirectory, { recursive: true }
            );

            return Promise.all([makeClientConfigFolder, makeServerConfigFolder])
                .then(() => Promise.resolve())
        });
}

const saveConfig = (configFilePath: string, config: SoldatConfig): Promise<void> => {
    return makeConfigsFolders()
        .then(() => fs.promises.writeFile(configFilePath, configToFileData(config))
            .then(() => concatClientConfig())
        )
        .catch(error => Promise.reject(error.message));
}

const concatClientConfig = (): Promise<void> => {
    let fullConfigData = "";
    let configFiles = [
        {"setting": ControlsSettings, "path": soldatPaths.clientControlsConfigFile},
        {"setting": CustomBindings, "path": soldatPaths.clientCustomBindingsConfigFile},
        {"setting": GameSettings, "path": soldatPaths.clientGameConfigFile},
        {"setting": GraphicsSettings, "path": soldatPaths.clientGraphicsConfigFile},
        {"setting": PlayerSettings, "path": soldatPaths.clientPlayerConfigFile},
        {"setting": SoundSettings, "path": soldatPaths.clientSoundConfigFile}
    ];

    const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> => input.status === 'fulfilled';
    return Promise.allSettled(
        configFiles.map(configFile => {
            return fs.promises.readFile(configFile.path, { encoding: "utf8" })
                .then(fileData => {
                    return fileData
                })
                .catch(error => {
                    let settings = new configFile.setting();
                    return configToFileData(settings.toConfig());
                })
        })
    )
    .then((results) => {
        return fs.promises.writeFile(soldatPaths.clientConfigFile,
            results
                .filter(isFulfilled)
                .map(result => result.value)
                .join("\n")
        );
    });
}

const loadControlsConfig = (): Promise<ControlsConfig> => {
    return loadConfig<ControlsConfig>(soldatPaths.clientControlsConfigFile);
}
const saveControlsConfig = (config: ControlsConfig): Promise<void> => {
    return saveConfig(soldatPaths.clientControlsConfigFile, config);
}

const loadCustomBindingsConfig = (): Promise<SoldatConfig> => {
    return loadConfig<SoldatConfig>(soldatPaths.clientCustomBindingsConfigFile);
}
const saveCustomBindingsConfig = (config: SoldatConfig): Promise<void> => {
    return saveConfig(soldatPaths.clientCustomBindingsConfigFile, config);
}

const loadGameConfig = (): Promise<GameConfig> => {
    return loadConfig<GameConfig>(soldatPaths.clientGameConfigFile);
}
const saveGameConfig = (config: GameConfig): Promise<void> => {
    return saveConfig(soldatPaths.clientGameConfigFile, config);
}

const loadGraphicsConfig = (): Promise<GraphicsConfig> => {
    return loadConfig<GraphicsConfig>(soldatPaths.clientGraphicsConfigFile);
}
const saveGraphicsConfig = (config: GraphicsConfig): Promise<void> => {
    return saveConfig(soldatPaths.clientGraphicsConfigFile, config);
}

const loadPlayerConfig = (): Promise<PlayerConfig> => {
    return loadConfig<PlayerConfig>(soldatPaths.clientPlayerConfigFile);
}
const savePlayerConfig = (config: PlayerConfig): Promise<void> => {
    return saveConfig(soldatPaths.clientPlayerConfigFile, config);
}

const loadSoundConfig = (): Promise<SoundConfig> => {
    return loadConfig<SoundConfig>(soldatPaths.clientSoundConfigFile);
}
const saveSoundConfig = (config: SoundConfig): Promise<void> => {
    return saveConfig(soldatPaths.clientSoundConfigFile, config);
}

const loadServerConfig = (): Promise<ServerConfig> => {
    return loadConfig<ServerConfig>(soldatPaths.serverConfigFile);
}
const saveServerConfig = (config: ServerConfig): Promise<void> => {
    return saveConfig(soldatPaths.serverConfigFile, config);
}
const loadServerMapsList = (): Promise<string[]> => {
    return fs.promises.readFile(soldatPaths.serverMapsList, { encoding: "utf8" })
        .then(fileData => {
            return fileData.split(/\r?\n/).filter(mapName => mapName.length > 0);
        })
        .catch(error => {
            console.warn("An error occurred when reading server's maps list file: ", error);
            return null;
        })
}
const saveServerMapsList = (mapsNames: string[]): Promise<void> => {
    let fileData = "";
    mapsNames.forEach(mapName => {
        if (mapName.length > 0) {
            fileData += mapName + "\r\n";
        }
    });

    return makeConfigsFolders()
        .then(() => fs.promises.writeFile(soldatPaths.serverMapsList, fileData))
        .catch(error => Promise.reject(error.message));
}

export {
    loadControlsConfig,
    saveControlsConfig,

    loadCustomBindingsConfig,
    saveCustomBindingsConfig,

    loadGameConfig,
    saveGameConfig,

    loadGraphicsConfig,
    saveGraphicsConfig,

    loadPlayerConfig,
    savePlayerConfig,

    loadSoundConfig,
    saveSoundConfig,

    loadServerConfig,
    saveServerConfig,
    loadServerMapsList,
    saveServerMapsList
}
