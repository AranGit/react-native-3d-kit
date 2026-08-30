import { Text as NativeText, type TextProps } from 'react-native';

const MAX_FONT_SIZE_MULTIPLIER = 1.5;

export function AppText(props: TextProps) {
  return (
    <NativeText maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} {...props} />
  );
}
