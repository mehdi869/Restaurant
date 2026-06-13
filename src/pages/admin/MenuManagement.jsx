import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import { Modal } from '../../components/ui/Modal'
import { MENU_ITEMS, CATEGORIES } from '../../data/menu-items'
import { Plus, Edit3, Trash2, Eye, EyeOff, X, Image } from 'lucide-react'

export default function MenuManagement() {
  const { addToast } = useToast()
  const [items, setItems] = useState(MENU_ITEMS)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', image_url: '', category: 'burgers', available: true,
  })

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', image_url: '', category: 'burgers', available: true })
    setEditing(null)
  }

  const openAdd = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      image_url: item.image_url,
      category: item.category,
      available: item.available,
    })
    setEditing(item.id)
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price) {
      addToast('Name and price are required', 'error')
      return
    }

    const itemData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      image_url: form.image_url.trim(),
      category: form.category,
      available: form.available,
    }

    if (editing) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editing)

        if (error) throw error
      } catch (err) {
        // Local update
      }
      setItems((prev) => prev.map((i) => (i.id === editing ? { ...i, ...itemData } : i)))
      addToast('Item updated', 'success')
    } else {
      const newItem = {
        ...itemData,
        id: Math.max(...items.map((i) => i.id)) + 1,
      }
      try {
        const { error } = await supabase
          .from('menu_items')
          .insert(newItem)

        if (error) throw error
      } catch (err) {
        // Local add
      }
      setItems((prev) => [...prev, newItem])
      addToast('Item added', 'success')
    }

    setShowModal(false)
    resetForm()
  }

  const toggleAvailability = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, available: !i.available } : i))
    )

    try {
      const item = items.find((i) => i.id === id)
      if (item) {
        supabase
          .from('menu_items')
          .update({ available: !item.available })
          .eq('id', id)
          .then(({ error }) => {
            if (error) throw error
          })
      }
    } catch (err) {
      // Silent
    }
  }

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))

    try {
      supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error
        })
    } catch (err) {
      // Silent
    }

    addToast('Item deleted', 'success')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Menu Items</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-charcoal-950 font-medium text-sm hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 hover:border-charcoal-700 transition-all animate-fade-in-up"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                {!item.available && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                    Hidden
                  </span>
                )}
              </div>
              <p className="text-charcoal-500 text-xs truncate">{item.category}</p>
              <p className="text-amber-400 font-semibold text-sm mt-0.5">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleAvailability(item.id)}
                className="p-2 rounded-lg text-charcoal-500 hover:text-amber-400 hover:bg-charcoal-800 transition-colors"
                title={item.available ? 'Hide from menu' : 'Show on menu'}
              >
                {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => openEdit(item)}
                className="p-2 rounded-lg text-charcoal-500 hover:text-blue-400 hover:bg-charcoal-800 transition-colors"
                title="Edit item"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 rounded-lg text-charcoal-500 hover:text-red-400 hover:bg-charcoal-800 transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm() }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {editing ? 'Edit Item' : 'Add Menu Item'}
            </h3>
            <button
              onClick={() => { setShowModal(false); resetForm() }}
              className="p-1 rounded-lg text-charcoal-500 hover:text-white hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-charcoal-400 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="Item name"
              />
            </div>

            <div>
              <label className="block text-sm text-charcoal-400 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                placeholder="Brief description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-charcoal-400 mb-1">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-charcoal-400 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-charcoal-400 mb-1">Image URL</label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                <input
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
                className="w-4 h-4 rounded border-charcoal-600 bg-charcoal-800 text-amber-500 focus:ring-amber-500/25"
              />
              <span className="text-sm text-charcoal-300">Available on menu</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm() }}
                className="flex-1 py-2.5 rounded-xl bg-charcoal-800 text-charcoal-300 font-medium hover:bg-charcoal-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-charcoal-950 font-semibold hover:bg-amber-400 transition-colors"
              >
                {editing ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
