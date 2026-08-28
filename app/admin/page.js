'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const [weapons, setWeapons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gameModes, setGameModes] = useState([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gameModeId, setGameModeId] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [{ data: cats }, { data: modes }, { data: weps }] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('game_modes').select('*'),
      supabase.from('weapons').select('*, categories(name), game_modes(name)')
    ]);
    if (cats) setCategories(cats);
    if (modes) setGameModes(modes);
    if (weps) setWeapons(weps);
  }

  async function handleAddWeapon(e) {
    e.preventDefault();
    if (!name) return alert('نام اسلحه را وارد کنید');
    setLoading(true);

    let imageUrl = '';
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('weapons').upload(fileName, file);
      if (!error) {
        const { data: publicURL } = supabase.storage.from('weapons').getPublicUrl(fileName);
        imageUrl = publicURL.publicUrl;
      }
    }

    const slug = name.toLowerCase().replace(/ /g, '-');
    const { error } = await supabase.from('weapons').insert([
      { name, slug, category_id: categoryId || null, game_mode_id: gameModeId || null, description, image_url: imageUrl }
    ]);

    if (!error) {
      alert('اسلحه با موفقیت اضافه شد!');
      setName('');
      setDescription('');
      setFile(null);
      fetchData();
    } else {
      alert('خطا در ثبت اسلحه');
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (confirm('مطمئنی می‌خواهی حذف کنی؟')) {
      await supabase.from('weapons').delete().eq('id', id);
      fetchData();
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-500">پنل مدیریت سایت</h1>
              <p className="text-xs text-zinc-400">افزودن و مدیریت اسلحه‌ها</p>
            </div>
          </div>
          <a href="/" className="text-xs bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition">
            <ArrowRight className="w-4 h-4" />
            بازگشت به سایت
          </a>
        </div>

        <form onSubmit={handleAddWeapon} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 space-y-4">
          <h3 className="font-bold text-amber-500 text-sm mb-2">افزودن اسلحه جدید</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">نام اسلحه</label>
              <input
                type="text"
                placeholder="مثلاً: M4 / DL Q33"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">حالت بازی</label>
              <select
                value={gameModeId}
                onChange={e => setGameModeId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">انتخاب حالت بازی...</option>
                {gameModes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">دسته‌بندی (AR, SMG و...)</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">انتخاب دسته...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">تصویر اسلحه</label>
              <input
                type="file"
                onChange={e => setFile(e.target.files[0])}
                className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-amber-500 hover:file:bg-zinc-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">توضیحات کوتاه</label>
            <textarea
              placeholder="توضیحات یا ویژگی‌های اسلحه..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 h-20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-zinc-950 font-bold py-3 rounded-xl hover:bg-amber-400 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'در حال ثبت...' : 'ثبت و ذخیره اسلحه'}
          </button>
        </form>

        <h3 className="font-bold text-sm text-zinc-400 mb-4">اسلحه‌های ثبت شده ({weapons.length})</h3>
        <div className="space-y-3">
          {weapons.map(w => (
            <div key={w.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {w.image_url && <img src={w.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div>
                  <h4 className="font-bold text-sm">{w.name}</h4>
                  <p className="text-xs text-zinc-500">{w.categories?.name || 'بدون دسته'}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(w.id)}
                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
  }
    
