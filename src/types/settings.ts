import { DateFormatStyle } from '../core/dateResolver';

export type DisplayMode = 'pill' | 'tooltip' | 'inline_replace';

export interface ExtensionSettings {
  enabled: boolean;
  displayMode: DisplayMode;
  formatStyle: DateFormatStyle;
  highlightColor: string;
  showRelativeOffset: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  displayMode: 'pill',
  formatStyle: 'with_day',
  highlightColor: '#1a73e8',
  showRelativeOffset: false,
};
