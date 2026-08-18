import React from "react";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

export interface AppSvgIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export type AppSvgIcon = React.ComponentType<AppSvgIconProps>;

export function WhatsAppGlyphIcon({ size = 24, color = "#10B981" }: AppSvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Path
        fill={color}
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
      />
    </Svg>
  );
}

export function WhatsAppBusinessIcon({ size = 24, color = "#10B981" }: AppSvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 192 192" fill="none" accessibilityRole="image">
      <Path
        fill={color}
        d="m60.359 160.867 2.894-5.256a6.003 6.003 0 0 0-4.284-.581l1.39 5.837ZM22 170l-5.837-1.39a6.002 6.002 0 0 0 7.227 7.227L22 170Zm9.133-38.359 5.837 1.39a6.001 6.001 0 0 0-.581-4.284l-5.256 2.894ZM96 176c44.183 0 80-35.817 80-80h-12c0 37.555-30.445 68-68 68v12Zm-38.535-9.877C68.9 172.42 82.04 176 96 176v-12c-11.884 0-23.04-3.043-32.747-8.389l-5.788 10.512Zm-34.075 9.714 38.358-9.133-2.78-11.674-38.358 9.133 2.78 11.674Zm1.906-45.585-9.133 38.358 11.674 2.78 9.133-38.359-11.674-2.779ZM16 96c0 13.959 3.58 27.1 9.877 38.535l10.512-5.788C31.043 119.039 28 107.884 28 96H16Zm80-80c-44.183 0-80 35.817-80 80h12c0-37.555 30.445-68 68-68V16Zm80 80c0-44.183-35.817-80-80-80v12c37.555 0 68 30.445 68 68h12Z"
      />
      <Path
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={12}
        d="M103 130H76V96h27c9.389 0 17 7.611 17 17s-7.611 17-17 17Zm-2-34H76V62h25c9.389 0 17 7.611 17 17s-7.611 17-17 17Z"
      />
    </Svg>
  );
}

function LucideSvg({ size = 24, color = "currentColor", strokeWidth = 2, children }: AppSvgIconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityRole="image"
    >
      {children}
    </Svg>
  );
}

export function ClientIcon(props: AppSvgIconProps) {
  return <LucideSvg {...props}><Path d="M2 21a8 8 0 0 1 13.292-6" /><Circle cx="10" cy="8" r="5" /><Path d="m16 19 2 2 4-4" /></LucideSvg>;
}

export function SupplierIcon(props: AppSvgIconProps) {
  return (
    <LucideSvg {...props}>
      <Path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <Path d="M15 18H9" />
      <Path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <Circle cx="17" cy="18" r="2" /><Circle cx="7" cy="18" r="2" />
    </LucideSvg>
  );
}

export function WorkIcon(props: AppSvgIconProps) {
  return <LucideSvg {...props}><Path d="M12 12h.01" /><Path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><Path d="M22 13a18.15 18.15 0 0 1-20 0" /><Rect width="20" height="14" x="2" y="6" rx="2" /></LucideSvg>;
}

export function PersonalIcon(props: AppSvgIconProps) {
  return <LucideSvg {...props}><Path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" /></LucideSvg>;
}

export function TemporaryIcon(props: AppSvgIconProps) {
  return <LucideSvg {...props}><Circle cx="12" cy="12" r="10" /><Path d="M12 6v6h4" /></LucideSvg>;
}

export function GoogleContactsIcon({ size = 24 }: AppSvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 500 500" accessibilityRole="image">
      <Path fill="#86A9FF" d="M199 244c-89 0-161 71-161 160v67c0 16 13 29 29 29h77l77-256z" />
      <Path fill="#578CFF" d="M462 349c0-58-48-105-106-105h-77v256h77c58 0 106-47 106-106" />
      <Path fill="#0057CC" d="M115 349c0-58 48-105 106-105h58c58 0 106 47 106 105v45c0 59-48 106-106 106H144c-16 0-29-13-29-29z" />
      <Circle cx="250" cy="99.4" r="99.4" fill="#0057CC" />
    </Svg>
  );
}

export function PlayStoreIcon({ size = 24, color = "#10B981" }: AppSvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Path fill={color} d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065 3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
    </Svg>
  );
}

export function WasapeameSymbolIcon({ size = 24 }: AppSvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none" accessibilityRole="image">
      <Defs>
        <LinearGradient id="wasapeameGreen" x1="110" y1="400" x2="402" y2="108" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#059669" /><Stop offset="1" stopColor="#34D399" />
        </LinearGradient>
      </Defs>
      <Path d="M389 324a170 170 0 0 1-233 59l-80 25 25-78A170 170 0 0 1 354 112" stroke="url(#wasapeameGreen)" strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m160 277 42 76 54-151 47 107L412 126" stroke="url(#wasapeameGreen)" strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m353 131 67-17-14 69" fill="url(#wasapeameGreen)" stroke="url(#wasapeameGreen)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
