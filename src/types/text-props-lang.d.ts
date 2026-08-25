// RN's bundled TextProps does not yet declare the runtime-supported `lang`
// prop (react-native-web ships it; native accepts it for text processing).
// Delete this augmentation once the react-native types include it.
declare module "react-native" {
  interface TextProps {
    /** ISO language code (e.g. "ar") hinting accessibility/text processing. */
    lang?: string;
  }
}

export {};
