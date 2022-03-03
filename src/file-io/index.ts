import fs from "fs/promises";
import { logger } from "..";
import { LidarConsolidatedConfig } from "../consolidator/types";

export default class FileIO {
  private static isWritingToFile: boolean = false;

  /**
   * Loads the contents of the config file and returns the contents, parsed as JSON.
   */
  public static load = async (
    path: string
  ): Promise<LidarConsolidatedConfig> => {
    logger.info(`Loading config from path "${path}"`);
    try {
      const data = await fs.readFile(path);

      try {
        const json = JSON.parse(data.toString()) as LidarConsolidatedConfig;
        return json;
      } catch (parseError) {
        throw Error("Parse JSON from file error: " + parseError);
      }
    } catch (fileError) {
      throw Error("Read file error: " + fileError);
    }
  };

  /**
   * Persist current config data to a file.
   */
  public static save = async (
    data: LidarConsolidatedConfig,
    path: string
  ): Promise<void> => {
    if (FileIO.isWritingToFile) {
      // only write if required and allowed
      throw Error("A save is already in progress");
    } else {
      logger.debug(`Persisting config to file ${path}`);
      FileIO.isWritingToFile = true; // prevent additional write actions
      await fs.writeFile(path, JSON.stringify(data, null, "\t"), {});
      FileIO.isWritingToFile = false; // allow new write actions
    }
  };
}
