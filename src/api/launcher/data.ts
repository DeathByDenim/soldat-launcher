import fs from "fs";
import path from "path";
import { isProduction } from "src/environment";
import { ipcRenderer } from "electron";

const appDir = ipcRenderer.invoke('getAppDataPath');
const filePath = appDir.then((dir: string) => {
    return path.resolve(isProduction ? dir : "", "./launcher.json");
});

const loadData = function(): Promise<string> {
    return filePath.then((path) => {
        return fs.promises.readFile(path, { encoding: "utf8" })
            .catch((error) => {
                console.warn("An error occurred when loading launcher's data", error);
                return null;
            });
    });
}

const saveData = function(fileContent: string): Promise<void> {
    return filePath.then((path) => {
        return fs.promises.writeFile(path, fileContent);
    });
}

export { loadData, saveData };
