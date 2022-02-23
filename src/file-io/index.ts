import fs from "fs";
import { getLogger } from "log4js";
import { LidarConfig } from "../redux/types";

const logger = getLogger("lidar-consolidation-agent");

export default class FileIO {
  private static isWritingToFile: boolean = false;

  /**
   * Loads the contents of the config file and returns the contents, parsed as JSON.
   */
  public static load = (path: string): Promise<LidarConfig[]> =>
    new Promise((resolve, reject) => {
      logger.info(`Loading config from path "${path}"`);
      fs.readFile(path, (err, data) => {
        if (err) {
          logger.error("Read file error:", err);
          reject(err);
        }
        try {
          const json = JSON.parse(data.toString());
          resolve(json);
        } catch (parseError) {
          logger.error("Parse JSON from file error:", parseError);
          reject(parseError);
        }
      });
    });

  /**
   * Persist current config data to a file.
   */
  public static save = async (data: object, path: string): Promise<void> =>
    new Promise((resolve, reject) => {
      if (FileIO.isWritingToFile) {
        // only write if required and allowed
        reject("A save is already in progress");
      } else {
        logger.debug(`Persisting config to file ${path}`);
        FileIO.isWritingToFile = true; // prevent additional write actions
        FileIO.writeToFile(data, path) // persist to file
          .catch((err) => {
            logger.error(`Could not write config data.`, err);
            reject(err);
          })
          .finally(() => {
            FileIO.isWritingToFile = false; // allow new write actions
            resolve();
          });
      }
    });

  /**
   * fs.writeFile, wrapped in a promise
   * @param state
   * @param path
   */
  private static writeToFile = (data: object, path: string): Promise<void> =>
    new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(data, null, "\t"), {}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
}
