import { BaseObject, ObjectConstructor, ObjectOptions } from "@/types/objects";

/**
 * @class ObjectFactory
 * @description Factory class for creating objects based on their type. this class didn't know the details of the obejct, it just knows how to create it.
 * @author [BlueNyang]
 * @example
 * ObjectFactory.register('tree', TreeObject);
 * const tree = ObjectFactory.create('tree', { id: 'tree1', x: 100, y: 200 });
 */
export class ObjectFactory {
  /** Object registry map */
  private static objectRegistry = new Map<string, ObjectConstructor<any>>();
  /**
   * @method register
   * @description Registers a new object type with its constructor.
   * @author [BlueNyang]
   * @param {string} type - Object type
   * @param {ObjectConstructor} constructor - Object constructor
   * @throws {Error} If the object type is already registered
   * @returns {void}
   * @example
   * ObjectFactory.register('tree', TreeObject);
   * @example
   * // Throws an error if 'tree' is already registered
   * ObjectFactory.register('tree', AnotherTreeObject);
   */
  public static register<T extends ObjectOptions>(
    type: string,
    constructor: ObjectConstructor<T>
  ): void {
    if (this.objectRegistry.has(type)) {
      throw new Error(`Object type "${type}" is already registered.`);
    }
    this.objectRegistry.set(type, constructor);
  }

  /**
   * @method getRegisteredTypes
   * @description Returns an array of all registered object types.
   * @author [BlueNyang]
   * @returns {string[]} Array of registered object types
   * @example
   * const types = ObjectFactory.getRegisteredTypes();
   */
  public static getRegisteredTypes(): string[] {
    return Array.from(this.objectRegistry.keys());
  }

  /**
   * @method isRegistered
   * @description Checks if an object type is registered.
   * @author [BlueNyang]
   * @param {string} type - Object type
   * @returns {boolean} True if the object type is registered, false otherwise
   * @example
   * const isRegistered = ObjectFactory.isRegistered('tree');
   */
  public static isRegistered(type: string): boolean {
    return this.objectRegistry.has(type);
  }

  /**
   * @method unregister
   * @description Unregisters an object type.
   * @author [BlueNyang]
   * @param {string} type - Object type
   * @returns {boolean} True if the object type was successfully unregistered, false if it was not registered
   * @example
   * const success = ObjectFactory.unregister('tree');
   */
  public static unregister(type: string): boolean {
    return this.objectRegistry.delete(type);
  }

  /**
   * @method create
   * @description Creates a new object of the specified type.
   * @author [BlueNyang]
   * @param {string} type - Object type
   * @param {ObjectOptions} options - Object options
   * @throws {Error} If the object type is not registered
   * @returns {BaseObject | null}
   * @example
   * const tree = ObjectFactory.create('tree', { id: 'tree1', x: 100, y: 200 });
   */
  public static create(type: string, options: ObjectOptions): BaseObject {
    const constructor = this.objectRegistry.get(type);
    if (!constructor) {
      throw new Error(`Object type "${type}" is not registered.`);
    }
    try {
      return new constructor({ ...options, type });
    } catch (error) {
      console.error(`Error creating object of type "${type}":`, error);
      throw new Error(`Failed to create object of type "${type}".`);
    }
  }

  public static createFromJSON(jsonData: Record<string, any> | string): BaseObject {
    try {
      const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      if (typeof data.type !== "string") {
        console.error("Invalid JSON data: 'type' is required and must be a string.");
        throw new Error("Invalid JSON data: 'type' is required and must be a string.");
      }

      const { type, ...options } = data;

      if (!type) {
        console.error("Object type is required in JSON data.");
        throw new Error("Object type is required in JSON data.");
      }

      return this.create(type, options);
    } catch (error) {
      console.error("Error creating object from JSON:", error);
      throw new Error("Failed to create object from JSON.");
    }
  }
}
