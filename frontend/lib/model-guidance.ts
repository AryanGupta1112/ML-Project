export const modelUseCaseGuide: Record<string, string> = {
  logistic_regression: "Easy to explain and usually stable.",
  decision_tree: "Simple rule-style model that is easy to understand.",
  random_forest: "Strong all-round model for mixed feature patterns.",
  knn: "Compares against similar past examples.",
  svm: "Often very accurate when classes are clearly separable."
};

export function getModelUseCase(modelName: string): string {
  return modelUseCaseGuide[modelName] ?? "General-purpose model for toxicity prediction.";
}
