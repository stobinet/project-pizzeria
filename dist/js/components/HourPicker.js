import { BaseWidget } from "./BaseWidget.js";
import { settings } from "../settings.js";

export class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
  }
}
