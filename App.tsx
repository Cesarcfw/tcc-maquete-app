import ConnectedApp from "./src/ui/ConnectedApp";
import { OfflineEvaluationApp } from "./src/ui/DemoApp";
import Constants from "expo-constants";

export default Constants.expoConfig?.extra?.appVariant === "evaluation"
  ? OfflineEvaluationApp
  : ConnectedApp;
