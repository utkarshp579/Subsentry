import GmailIntegration from '@/app/components/gmail-integration/GmailIntegration';

export default function SettingsPage() {
  return (
    <div className="settings-page">
      {}
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {}
      <div className="settings-content">
        <GmailIntegration />
      </div>
    </div>
  );
}