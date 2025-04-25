// tagged for gh commit 24 apr 25
/**
 * Represents an AI model.
 */
export interface AIModel {
  /**
   * The ID of the model.
   */
  id: string;
  /**
   * The name of the model.
   */
  name: string;
  /**
   * The type of the model.
   */
  type: string;
}

/**
 * Asynchronously retrieves a list of available AI and image models.
 *
 * @returns A promise that resolves to an array of AIModel objects.
 */
export async function getModels(): Promise<AIModel[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      type: 'ai',
    },
    {
      id: 'leonardo-ai',
      name: 'Leonardo.ai',
      type: 'image',
    },{
      id: 'dalle-2',
      name: 'Dalle-2',
      type: 'image',
    },
  ];
}

/**
 * Asynchronously updates the selected AI or image model.
 *
 * @param modelType The type of the model to update (e.g., 'ai' or 'image').
 * @param selection The ID of the selected model.
 * @returns A promise that resolves when the model is successfully updated.
 */
export async function updateModel(modelType: string, selection: string): Promise<void> {
  // TODO: Implement this by calling an API.
  console.log(`Updating model of type ${modelType} to ${selection}`);
}
