import { Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  SecurityReportPage,
  OverviewPage,
  AttackSurfacePage,
  DragonComposerPage,
  FindingsPage,
  UpgradeMatrixPage,
  SelectorDiffPage,
  RolesPage,
  SlotsPage,
  BeaconPage,
  ImpactPage
} from '@pages/index';

const { Sider, Content, Header } = Layout;

const navigation = [
  { key: '/', label: 'Security Report', path: '/' },
  { key: '/overview', label: 'Overview', path: '/overview' },
  { key: '/impact', label: 'Impact', path: '/impact' },
  { key: '/attack-surface', label: 'Attack Surface', path: '/attack-surface' },
  { key: '/dragon', label: 'Dragon Composer', path: '/dragon' },
  { key: '/findings', label: 'Findings', path: '/findings' },
  { key: '/upgrade-matrix', label: 'Upgrade Matrix', path: '/upgrade-matrix' },
  { key: '/selector-diff', label: 'Selector Diff', path: '/selector-diff' },
  { key: '/beacon', label: 'Beacon Meltdown', path: '/beacon' },
  { key: '/roles', label: 'Roles', path: '/roles' },
  { key: '/slots', label: 'EIP-1967 Slots', path: '/slots' }
];

const menuItems: MenuProps['items'] = navigation.map((item) => ({
  key: item.key,
  label: <Link to={item.path}>{item.label}</Link>
}));

export default function App() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={80} width={260} style={{ background: 'transparent', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '24px 16px', color: '#f4f7ff' }}>
          <Typography.Title level={4} style={{ color: 'inherit', marginBottom: 0 }}>
            Sentinel Portal
          </Typography.Title>
          <Typography.Text type="secondary">Upgradeability risk cockpit</Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : location.pathname]}
          items={menuItems}
          style={{ background: 'transparent', borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: 'transparent', padding: '16px 32px' }}>
          <Typography.Title level={3} style={{ color: '#f4f7ff', margin: 0 }}>
            {navigation.find((item) => item.path === (location.pathname === '/' ? '/' : location.pathname))?.label ??
              'Security Report'}
          </Typography.Title>
        </Header>
        <Content style={{ padding: '24px 32px' }}>
          <Routes>
            <Route path="/" element={<SecurityReportPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/report" element={<SecurityReportPage />} />
            <Route path="/attack-surface" element={<AttackSurfacePage />} />
            <Route path="/dragon" element={<DragonComposerPage />} />
            <Route path="/findings" element={<FindingsPage />} />
            <Route path="/upgrade-matrix" element={<UpgradeMatrixPage />} />
            <Route path="/selector-diff" element={<SelectorDiffPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/slots" element={<SlotsPage />} />
            <Route path="/beacon" element={<BeaconPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
