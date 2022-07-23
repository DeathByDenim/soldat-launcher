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
            const makeClientConfigFolder = soldatPaths.clientConfigsDirectory.then(d => {
                fs.promises.mkdir(d, { recursive: true });
            });
            const makeServerConfigFolder = soldatPaths.serverConfigsDirectory.then(d => {
                fs.promises.mkdir(d, { recursive: true });
            });

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
            return configFile.path.then(path => {
                return fs.promises.readFile(path, { encoding: "utf8" })
                    .then(fileData => {
                        return fileData
                    })
                    .catch(error => {
                        let settings = new configFile.setting();
                        return configToFileData(settings.toConfig());
                    })
            })
        })
    )
    .then((results) => {
        return soldatPaths.clientConfigFile.then(file => {
            return fs.promises.writeFile(file,
                results
                    .filter(isFulfilled)
                    .map(result => result.value)
                    .join("\n")
            );
        });
    });
}

const loadControlsConfig = (): Promise<ControlsConfig> => {
    return soldatPaths.clientControlsConfigFile.then(file => {
        return loadConfig<ControlsConfig>(file);
    });
}
const saveControlsConfig = (config: ControlsConfig): Promise<void> => {
    return soldatPaths.clientControlsConfigFile.then(file => {
        return saveConfig(file, config);
    });
}

const loadCustomBindingsConfig = (): Promise<SoldatConfig> => {
    return soldatPaths.clientCustomBindingsConfigFile.then((file: string) => {
        return loadConfig<SoldatConfig>(file);
    });
}
const saveCustomBindingsConfig = (config: SoldatConfig): Promise<void> => {
    return soldatPaths.clientCustomBindingsConfigFile.then((file: string) => {
        return saveConfig(file, config);
    });
}

const loadGameConfig = (): Promise<GameConfig> => {
    return soldatPaths.clientGameConfigFile.then((file: string) => {
        return loadConfig<GameConfig>(file);
    });
}
const saveGameConfig = (config: GameConfig): Promise<void> => {
    return soldatPaths.clientGameConfigFile.then((file: string) => {
        return saveConfig(file, config);
    });
}

const loadGraphicsConfig = (): Promise<GraphicsConfig> => {
    return soldatPaths.clientGraphicsConfigFile.then((file: string) => {
        return loadConfig<GraphicsConfig>(file);
    });
}
const saveGraphicsConfig = (config: GraphicsConfig): Promise<void> => {
    return soldatPaths.clientGraphicsConfigFile.then((file: string) => {
        return saveConfig(file, config);
    });
}

const loadPlayerConfig = (): Promise<PlayerConfig> => {
    return soldatPaths.clientPlayerConfigFile.then((file: string) => {
        return loadConfig<PlayerConfig>(file);
    });
}
const savePlayerConfig = (config: PlayerConfig): Promise<void> => {
    return soldatPaths.clientPlayerConfigFile.then((file: string) => {
        return saveConfig(file, config);
    });
}

const loadSoundConfig = (): Promise<SoundConfig> => {
    return soldatPaths.clientSoundConfigFile.then((file: string) => {
        return loadConfig<SoundConfig>(file);
    });
}
const saveSoundConfig = (config: SoundConfig): Promise<void> => {
    return soldatPaths.clientSoundConfigFile.then((file: string) => {
        return saveConfig(file, config);
    });
}

const loadServerConfig = (): Promise<ServerConfig> => {
    return soldatPaths.serverConfigFile.then((file: string) => {
        return loadConfig<ServerConfig>(file);
    });
}
const saveServerConfig = (config: ServerConfig): Promise<void> => {
    return soldatPaths.serverConfigFile.then((file: string) => {
        return saveConfig(file, config);
    });
}
const loadServerMapsList = (): Promise<string[]> => {
    return soldatPaths.serverMapsList.then((list: string) => {
        return fs.promises.readFile(list, { encoding: "utf8" })
            .then(fileData => {
                return fileData.split(/\r?\n/).filter(mapName => mapName.length > 0);
            })
            .catch(error => {
                console.warn("An error occurred when reading server's maps list file: ", error);
                return null;
            })
    });
}
const saveServerMapsList = (mapsNames: string[]): Promise<void> => {
    let fileData = "";
    mapsNames.forEach(mapName => {
        if (mapName.length > 0) {
            fileData += mapName + "\r\n";
        }
    });

    return soldatPaths.serverMapsList.then((list: string) => {
        return makeConfigsFolders()
            .then(() => fs.promises.writeFile(list, fileData))
            .catch(error => Promise.reject(error.message));
    });
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
