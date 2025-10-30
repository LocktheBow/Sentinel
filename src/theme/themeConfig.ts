import type { ThemeConfig } from 'antd';

export const brandColors = {
  primary: '#5bd5ff',
  secondary: '#8c7bff',
  background: '#0f1117',
  surface: '#161b26',
  surfaceMute: '#1f2533',
  text: '#f4f7ff',
  danger: '#ff5c5c',
  warning: '#f6c344',
  success: '#4cd6a5'
};

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: brandColors.primary,
    colorBgBase: brandColors.background,
    colorBgContainer: brandColors.surface,
    colorBgLayout: brandColors.background,
    colorBgElevated: brandColors.surfaceMute,
    colorBgSpotlight: brandColors.surfaceMute,
    colorTextBase: brandColors.text,
    colorText: brandColors.text,
    colorTextSecondary: '#c8d1f5',
    colorTextTertiary: '#8fa3d9',
    colorTextHeading: brandColors.text,
    colorTextLabel: '#c8d1f5',
    colorBorder: '#2a3244',
    colorBorderSecondary: '#323a4f',
    colorBorderBg: brandColors.surfaceMute,
    colorFillSecondary: 'rgba(91, 213, 255, 0.12)',
    colorFillAlter: '#1f2533',
    colorFillContent: '#1f2533',
    colorBgMask: 'rgba(15, 17, 23, 0.78)',
    borderRadius: 12,
    lineWidth: 1,
    controlOutline: brandColors.secondary,
    controlOutlineWidth: 1,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    controlHeight: 40,
    wireframe: false
  },
  components: {
    Layout: {
      bodyBg: brandColors.background,
      headerBg: brandColors.surface,
      footerBg: brandColors.surface
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: '#c8d1f5',
      itemHoverColor: brandColors.text,
      itemSelectedColor: brandColors.text,
      itemSelectedBg: 'rgba(91, 213, 255, 0.12)'
    },
    Card: {
      colorBgContainer: brandColors.surface,
      colorBorderSecondary: 'rgba(255,255,255,0.08)',
      padding: 20,
      borderRadiusLG: 16,
      headerBg: brandColors.surface
    },
    Alert: {
      colorBgContainer: brandColors.surfaceMute,
      colorText: brandColors.text,
      colorBorder: 'rgba(91, 213, 255, 0.3)',
      colorInfoBg: 'rgba(91, 213, 255, 0.12)',
      colorInfoBorder: 'rgba(91, 213, 255, 0.4)'
    },
    Statistic: {
      titleColor: '#c8d1f5',
      contentColor: brandColors.text
    },
    Select: {
      selectorBg: brandColors.surfaceMute,
      colorBgElevated: brandColors.surfaceMute,
      colorText: brandColors.text,
      optionSelectedColor: brandColors.text,
      optionSelectedBg: 'rgba(91, 213, 255, 0.18)'
    },
    Input: {
      colorBgContainer: brandColors.surfaceMute,
      colorText: brandColors.text,
      colorBorder: '#2a3244',
      activeBorderColor: brandColors.primary
    },
    Upload: {
      colorBgContainer: brandColors.surfaceMute,
      colorBorder: 'rgba(91, 213, 255, 0.4)'
    },
    List: {
      colorBgContainer: brandColors.surface,
      colorText: brandColors.text,
      headerBg: brandColors.surface,
      footerBg: brandColors.surface
    },
    Table: {
      colorBgContainer: brandColors.surface,
      headerBg: brandColors.surfaceMute,
      headerColor: brandColors.text,
      rowHoverBg: 'rgba(91, 213, 255, 0.08)',
      borderColor: 'rgba(255,255,255,0.08)'
    },
    Drawer: {
      colorBgElevated: brandColors.surface,
      colorText: brandColors.text
    },
    Modal: {
      colorBgElevated: brandColors.surface,
      colorText: brandColors.text,
      contentBg: brandColors.surface
    },
    Tag: {
      defaultBg: 'rgba(91, 213, 255, 0.15)',
      colorBorder: 'transparent',
      colorText: brandColors.text
    },
    Anchor: {
      colorText: '#c8d1f5'
    }
  }
};
