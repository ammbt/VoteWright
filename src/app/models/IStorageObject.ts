/**
 * Base interface for any object that uses a firebase storage id.
 */
export interface IStorageObject {
	/**
	 * The is the firebase storage id. This is not persisted.
	 */
	storageId?: string;
}
