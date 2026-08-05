import { useState } from "react"
import { Plus, Trash2, Edit2, Check, X, Tag, Search, Star } from "lucide-react"

export default function CategoryManager({ categories, setCategories, supabase }: { categories: any[], setCategories: any, supabase: any }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [newCatName, setNewCatName] = useState("")
  const [newCatParent, setNewCatParent] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    const oldCat = categories.find(c => c.id === id)
    const { error } = await supabase.from('categories').update({ name: editName.trim() }).eq('id', id)
    if (!error) {
      if (oldCat && oldCat.name !== editName.trim()) {
        if (!oldCat.parent_id) {
          await supabase.from('products').update({ category: editName.trim() }).eq('category', oldCat.name)
        }
      }
      setCategories(categories.map(c => c.id === id ? { ...c, name: editName.trim() } : c))
      setEditingId(null)
    } else {
      alert("Error al actualizar: " + (error.message || "No se pudo actualizar"))
    }
  }

  const handleToggleFeatured = async (id: string, currentVal: boolean) => {
    const { error } = await supabase.from('categories').update({ is_featured_on_home: !currentVal }).eq('id', id)
    if (!error) {
      setCategories(categories.map(c => c.id === id ? { ...c, is_featured_on_home: !currentVal } : c))
    } else alert("Error al actualizar: " + (error?.message || ""))
  }

  const handleUpdateSortOrder = async (id: string, newOrder: number) => {
    const { error } = await supabase.from('categories').update({ sort_order: newOrder }).eq('id', id)
    if (!error) {
      setCategories(categories.map(c => c.id === id ? { ...c, sort_order: newOrder } : c))
    } else alert("Error al actualizar orden: " + (error?.message || ""))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta categoría? (Los productos no se borrarán)")) return
    
    const getDescendantIds = (catId: string): string[] => {
      const children = categories.filter(c => c.parent_id === catId)
      let ids: string[] = []
      for (const child of children) {
        ids.push(child.id)
        ids = ids.concat(getDescendantIds(child.id))
      }
      return ids
    }

    const allRemovedIds = new Set([id, ...getDescendantIds(id)])

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(categories.filter(c => !allRemovedIds.has(c.id)))
    } else {
      alert("Error al eliminar categoría: " + (error.message || "No se pudo eliminar"))
    }
  }

  const handleCreate = async () => {
    if (!newCatName.trim()) return
    const { data, error } = await supabase.from('categories').insert([{
      name: newCatName.trim(),
      parent_id: newCatParent,
      icon: 'Tag'
    }]).select()
    if (!error && data) {
      setCategories([...categories, data[0]])
      setNewCatName("")
      setNewCatParent(null)
    } else {
      alert("Error al crear categoría: " + (error?.message || ""))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="font-black text-slate-800 text-lg">Gestor de Categorías</h2>
        
        {/* Create Form */}
        <div className="flex gap-2 flex-col bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400">Crear Nueva Categoría</p>
          <input 
            type="text" 
            placeholder="Nombre de categoría..." 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold"
          />
          <select 
            value={newCatParent || ""} 
            onChange={(e) => setNewCatParent(e.target.value || null)}
            className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold"
          >
            <option value="">Principal (Sin Padre)</option>
            {categories.filter(c => !c.parent_id).map(main => (
              <optgroup key={main.id} label={main.name}>
                <option value={main.id}>{main.name} (Subcategoría)</option>
                {categories.filter(sub => sub.parent_id === main.id).map(sub => (
                  <option key={sub.id} value={sub.id}>-- {sub.name} (Hoja)</option>
                ))}
              </optgroup>
            ))}
          </select>
          <button onClick={handleCreate} className="h-10 bg-blue-600 text-white font-black rounded-xl text-xs uppercase">
            Agregar
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar categoría o subcategoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white shadow-sm font-semibold text-sm focus:border-blue-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Tree View */}
        <div className="space-y-2 mt-4">
          {(() => {
            const query = searchQuery.toLowerCase().trim()
            const matchesSearch = (cat: any): boolean => {
              if (!query) return true
              if (cat.name.toLowerCase().includes(query)) return true
              const children = categories.filter(c => c.parent_id === cat.id)
              return children.some(matchesSearch)
            }
            const visibleMainCats = categories.filter(c => !c.parent_id).filter(matchesSearch)

            return visibleMainCats.map(main => {
              const showAllSubs = query === "" || main.name.toLowerCase().includes(query)
              const actualSubs = showAllSubs 
                ? categories.filter(sub => sub.parent_id === main.id) 
                : categories.filter(sub => sub.parent_id === main.id).filter(matchesSearch)

              return (
                <div key={main.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <CatRow cat={main} editingId={editingId} setEditingId={setEditingId} editName={editName} setEditName={setEditName} handleUpdate={handleUpdate} handleDelete={handleDelete} handleToggleFeatured={handleToggleFeatured} handleUpdateSortOrder={handleUpdateSortOrder} isMain />
                  
                  <div className="pl-6 space-y-2 border-l-2 border-slate-200 ml-2">
                    {actualSubs.map(sub => {
                      const showAllLeafs = query === "" || sub.name.toLowerCase().includes(query) || showAllSubs
                      const actualLeafs = showAllLeafs
                        ? categories.filter(leaf => leaf.parent_id === sub.id)
                        : categories.filter(leaf => leaf.parent_id === sub.id).filter(matchesSearch)

                      return (
                        <div key={sub.id} className="space-y-2">
                          <CatRow cat={sub} editingId={editingId} setEditingId={setEditingId} editName={editName} setEditName={setEditName} handleUpdate={handleUpdate} handleDelete={handleDelete} handleToggleFeatured={handleToggleFeatured} handleUpdateSortOrder={handleUpdateSortOrder} />
                          
                          <div className="pl-6 space-y-1 border-l-2 border-slate-200 ml-2">
                            {actualLeafs.map(leaf => (
                              <CatRow key={leaf.id} cat={leaf} editingId={editingId} setEditingId={setEditingId} editName={editName} setEditName={setEditName} handleUpdate={handleUpdate} handleDelete={handleDelete} handleToggleFeatured={handleToggleFeatured} handleUpdateSortOrder={handleUpdateSortOrder} isLeaf />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}

function CatRow({ cat, editingId, setEditingId, editName, setEditName, handleUpdate, handleDelete, handleToggleFeatured, handleUpdateSortOrder, isMain, isLeaf }: any) {
  const isEditing = editingId === cat.id
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between group w-full pr-4 py-1 gap-2">
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input 
            type="text" 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)}
            className="h-8 px-2 rounded-lg border-2 border-blue-400 text-sm font-bold w-48"
            autoFocus
          />
        ) : (
          <span className={`text-sm ${isMain ? 'font-black text-slate-800' : isLeaf ? 'font-medium text-slate-500' : 'font-bold text-slate-600'}`}>
            {cat.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Sort Order Input */}
        <div className="flex items-center gap-1.5" title="Orden de visualización (menor a mayor)">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Orden:</span>
          <input 
            type="number"
            value={cat.sort_order || 0}
            onChange={(e) => handleUpdateSortOrder(cat.id, parseInt(e.target.value) || 0)}
            className="w-12 h-7 px-1 text-center rounded bg-white border border-slate-200 text-xs font-semibold"
          />
        </div>
        
        {/* Featured Toggle */}
        <div className="flex items-center gap-1.5" title="Destacar esta categoría en el Home">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Destacar:</span>
          <button 
            onClick={() => handleToggleFeatured(cat.id, !!cat.is_featured_on_home)}
            className={`size-6 rounded flex items-center justify-center transition-colors ${cat.is_featured_on_home ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-300'}`}
          >
            <Star className={`size-3.5 ${cat.is_featured_on_home ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-1 ml-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button onClick={() => handleUpdate(cat.id)} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Check className="size-4" /></button>
              <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg"><X className="size-4" /></button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditingId(cat.id); setEditName(cat.name) }} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Edit2 className="size-4" /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><Trash2 className="size-4" /></button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
