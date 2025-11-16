import { Font } from "@react-pdf/renderer";
import TajawalRegular from "../../fonts/Tajawal-Regular.ttf";
import TajawalLight from "../../fonts/Tajawal-Light.ttf";
import TajawalMedium from "../../fonts/Tajawal-Medium.ttf";
import TajawalBold from "../../fonts/Tajawal-Bold.ttf";
import TajawalExtraBold from "../../fonts/Tajawal-ExtraBold.ttf";

/**
 * Register Arabic Tajawal font family with all weights
 * This font supports RTL (Right-to-Left) text rendering for Arabic
 */
export const registerArabicFont = () => {
  Font.register({
    family: "Tajawal",
    fonts: [
      {
        src: TajawalRegular,
        fontWeight: 400,
      },
      {
        src: TajawalLight,
        fontWeight: 300,
      },
      {
        src: TajawalMedium,
        fontWeight: 500,
      },
      {
        src: TajawalBold,
        fontWeight: 700,
      },
      {
        src: TajawalExtraBold,
        fontWeight: 800,
      },
    ],
  });
};
