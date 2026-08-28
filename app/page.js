'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Sword, Search, ChevronRight, Zap } from 'lucide-react';

export default function Home() {
  const [weapons, setWeapons] = useState([]);
  const [gameModes, setGameModes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [loadouts, setLoadouts] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    const [{ data: modes }, { data: cats }, { data: weps }] = await Promise.all([
      supabase.from('game_modes').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('weapons').select('*, categories(name, slug), game_modes(name, slug)')
    ]);

    if (modes) setGameModes(modes);
    if (cats) setCategories(cats);
    if (weps) setWeapons(weps);
    setLoading(false);
  }

  async function fetchLoadouts(weaponId) {
    const { data } = await supabase
      .from('loadouts')
      .select('*, loadout_attachments(*, attachments(name, slot))')
      .eq('weapon_id', weaponId);
    if (data) setLoadouts(data);
  }

  const filteredWeapons = weapons.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = selectedMode === 'all' || w.game_modes?.slug === selectedMode;
    const matchesCat = selectedCategory === 'all' || w.categories?.slug === selectedCategory;
    return matchesSearch && matchesMode && matchesCat;
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-amber-500/20">
              <Sword className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-wider text-amber-500">کالاف باز</h1>
              <p className="text-xs text-zinc-400">مرجع تخصصی لودآوت و اسلحه‌ها</p>
            </div>
          </div>
          <a href="/admin" className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-lg transition border border-zinc-700 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            پنل ادمین
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedMode('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${selectedMode === 'all' ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            همه حالت‌ها
          </button>
          {gameModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.slug)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${selectedMode === mode.slug ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              {mode.name}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-3 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="جستجوی اسلحه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-11 pl-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${selectedCategory === 'all' ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
            >
              همه دسته‌ها
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat.slug ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">در حال بارگذاری اسلحه‌ها...</div>
        ) : filteredWeapons.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 mt-6">
            <p className="text-zinc-400">اسلحه‌ای پیدا نشد!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredWeapons.map(weapon => (
              <div
                key={weapon.id}
                onClick={() => { setSelectedWeapon(weapon); fetchLoadouts(weapon.id); }}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition cursor-pointer group flex flex-col"
              >
                {weapon.image_url && (
                  <div className="h-40 bg-zinc-950 overflow-hidden relative">
                    <img src={weapon.image_url} alt={weapon.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-md font-bold">
                      {weapon.categories?.name || 'عمومی'}
                    </span>
                    <h3 className="text-lg font-bold mt-2 text-zinc-100 group-hover:text-amber-400 transition">{weapon.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{weapon.description || 'بدون توضیحات'}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-amber-500 font-bold">
                    <span>مشاهده لودآوت‌ها</span>
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedWeapon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-black text-amber-500">{selectedWeapon.name}</h2>
                <p className="text-xs text-zinc-400">بهترین اتچمنت‌ها و لودآوت‌ها</p>
              </div>
              <button
                onClick={() => setSelectedWeapon(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {loadouts.length === 0 ? (
                <p className="text-center py-8 text-zinc-500 text-sm">هنوز لودآوتی برای این اسلحه ثبت نشده است.</p>
              ) : (
                loadouts.map(loadout => (
                  <div key={loadout.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-sm text-zinc-200">{loadout.name}</h4>
                    </div>
                    {loadout.description && <p className="text-xs text-zinc-400 mb-3">{loadout.description}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-900">
                      {loadout.loadout_attachments?.map(la => (
                        <div key={la.id} className="bg-zinc-900/60 px-3 py-2 rounded-lg flex justify-between items-center text-xs">
                          <span className="text-zinc-500">{la.slot}:</span>
                          <span className="font-semibold text-zinc-200">{la.attachments?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
    }
              
