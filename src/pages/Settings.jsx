import { useState, useEffect } from 'react';
import { settings, cron } from '../api/client';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Settings as SettingsIcon, Globe, MessageSquare, Palette, Play, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settingsList, setSettingsList] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [themes, setThemes] = useState([]);
  const [cronStatus, setCronStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'general') {
        const res = await settings.list({ category: 'general' });
        setSettingsList(res.data.data || []);
        const form = {};
        (res.data.data || []).forEach(s => { form[s.key] = s.value; });
        setFormData(form);
      } else if (activeTab === 'languages') {
        const res = await settings.listLanguages();
        setLanguages(res.data.data || []);
      } else if (activeTab === 'themes') {
        const res = await settings.listThemes();
        setThemes(res.data.data || []);
      } else if (activeTab === 'cron') {
        const res = await cron.getStatus();
        setCronStatus(res.data.data || {});
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsArray = Object.entries(formData).map(([key, value]) => ({ key, value }));
      await settings.bulkUpdate(settingsArray);
      alert('Settings saved!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const runCronJob = async (job) => {
    try {
      let res;
      switch (job) {
        case 'cashback': res = await cron.settleCashback(); break;
        case 'referral_referred': res = await cron.settleReferralReferred(); break;
        case 'referral_referrer': res = await cron.settleReferralReferrer(); break;
        case 'affiliate': res = await cron.settleAffiliateCommission(); break;
        case 'seller': res = await cron.settleSellerCommission(); break;
        case 'all': res = await cron.runAll(); break;
      }
      alert(res.data.message);
      fetchData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const setDefaultLanguage = async (id) => {
    try {
      await settings.setDefaultLanguage(id);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const switchTheme = async (id) => {
    try {
      await settings.switchTheme(id);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'languages', label: 'Languages', icon: Globe },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'cron', label: 'Cron Jobs', icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon /> Settings</h1>

      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent hover:border-gray-300'}`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card><p className="text-center py-8">Loading...</p></Card>
      ) : (
        <>
          {activeTab === 'general' && (
            <Card>
              <h3 className="font-semibold mb-4">General Settings</h3>
              <div className="space-y-4">
                <Input label="Site Name" value={formData.site_name || ''} onChange={(e) => setFormData({ ...formData, site_name: e.target.value })} />
                <Input label="Site URL" value={formData.site_url || ''} onChange={(e) => setFormData({ ...formData, site_url: e.target.value })} />
                <Input label="Support Email" value={formData.support_email || ''} onChange={(e) => setFormData({ ...formData, support_email: e.target.value })} />
                <Input label="Support Phone" value={formData.support_phone || ''} onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })} />
                <Input label="Currency" value={formData.currency || 'USD'} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
                <Input label="Referral Bonus (Referrer)" type="number" value={formData.referral_bonus_referrer || '100'} onChange={(e) => setFormData({ ...formData, referral_bonus_referrer: e.target.value })} />
                <Input label="Referral Bonus (Referred)" type="number" value={formData.referral_bonus_referred || '50'} onChange={(e) => setFormData({ ...formData, referral_bonus_referred: e.target.value })} />
                <Button onClick={saveSettings}>Save Settings</Button>
              </div>
            </Card>
          )}

          {activeTab === 'languages' && (
            <Card>
              <h3 className="font-semibold mb-4">Languages</h3>
              <div className="space-y-2">
                {languages.map(lang => (
                  <div key={lang._id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-gray-500 ml-2">({lang.code})</span>
                      {lang.isDefault && <span className="badge badge-success ml-2">Default</span>}
                    </div>
                    <div className="flex gap-2">
                      {!lang.isDefault && <Button size="sm" variant="secondary" onClick={() => setDefaultLanguage(lang._id)}>Set Default</Button>}
                    </div>
                  </div>
                ))}
                {languages.length === 0 && <p className="text-gray-500">No languages configured</p>}
              </div>
            </Card>
          )}

          {activeTab === 'themes' && (
            <Card>
              <h3 className="font-semibold mb-4">Themes</h3>
              <div className="grid grid-cols-3 gap-4">
                {themes.map(theme => (
                  <div key={theme._id} className={`p-4 border rounded ${theme.isActive ? 'border-blue-500 bg-blue-50' : ''}`}>
                    {theme.thumbnail && <img src={theme.thumbnail} alt="" className="w-full h-32 object-cover rounded mb-2" />}
                    <h4 className="font-medium">{theme.name}</h4>
                    <p className="text-sm text-gray-500">{theme.description}</p>
                    {theme.isActive ? (
                      <span className="badge badge-success mt-2">Active</span>
                    ) : (
                      <Button size="sm" className="mt-2" onClick={() => switchTheme(theme._id)}>Activate</Button>
                    )}
                  </div>
                ))}
                {themes.length === 0 && <p className="text-gray-500 col-span-3">No themes configured</p>}
              </div>
            </Card>
          )}

          {activeTab === 'cron' && (
            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold mb-4">Settlement Status</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div><div className="text-2xl font-bold text-yellow-500">{cronStatus.pendingCashback || 0}</div><div className="text-sm text-gray-500">Pending Cashback</div></div>
                  <div><div className="text-2xl font-bold text-blue-500">{cronStatus.pendingReferrals || 0}</div><div className="text-sm text-gray-500">Pending Referrals</div></div>
                  <div><div className="text-2xl font-bold text-purple-500">{cronStatus.pendingAffiliateCommissions || 0}</div><div className="text-sm text-gray-500">Pending Affiliate</div></div>
                  <div><div className="text-2xl font-bold text-green-500">{cronStatus.pendingSellerCommissions || 0}</div><div className="text-sm text-gray-500">Pending Seller</div></div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4">Run Settlement Jobs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="secondary" onClick={() => runCronJob('cashback')}><Play size={16} /> Settle Cashback</Button>
                  <Button variant="secondary" onClick={() => runCronJob('referral_referred')}><Play size={16} /> Settle Referral (Referred)</Button>
                  <Button variant="secondary" onClick={() => runCronJob('referral_referrer')}><Play size={16} /> Settle Referral (Referrer)</Button>
                  <Button variant="secondary" onClick={() => runCronJob('affiliate')}><Play size={16} /> Settle Affiliate</Button>
                  <Button variant="secondary" onClick={() => runCronJob('seller')}><Play size={16} /> Settle Seller</Button>
                  <Button onClick={() => runCronJob('all')}><Play size={16} /> Run All</Button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
