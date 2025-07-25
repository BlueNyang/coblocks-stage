import { BaseObject, ObjectConstructor, ObjectOptions } from "@/types/objects";
import { ObjectCallbacks } from "@/types/callbacks";

/**
 * Factory for creating objects based on their type
 */
export class ObjectFactory {
  private static objectRegistry = new Map<string, ObjectConstructor<any>>();

  /**
   * Registers a new object type with its constructor
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

  /** Returns an array of all registered object types */
  public static getRegisteredTypes(): string[] {
    return Array.from(this.objectRegistry.keys());
  }

  /** Checks if an object type is registered */
  public static isRegistered(type: string): boolean {
    return this.objectRegistry.has(type);
  }

  /** Unregisters an object type */
  public static unregister(type: string): boolean {
    return this.objectRegistry.delete(type);
  }

  /** Creates a new object of the specified type */
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
