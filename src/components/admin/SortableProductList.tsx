import { useState, Fragment } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

export default function SortableProductList({ products, setProducts, supabase, categories }: { products: any[], setProducts: any, supabase: any, categories?: any[] }) {
  const [filterCat, setFilterCat] = useState("Todos")

  // Filter products by category if selected
  const filteredProducts = filterCat === "Todos" 
    ? products 
    : products.filter(p => {
        const cat = categories?.find(c => c.name === filterCat)
        if (!cat) return p.category === filterCat
        
        // Match main category or its subcategories
        const isMain = !cat.parent_id
        const catSubs = categories?.filter(c => c.parent_id === cat.id) || []
        const catLeafs = categories?.filter(c => catSubs.some(sub => sub.id === c.parent_id)) || []
        const allRelevantIds = [cat.id, ...catSubs.map(c => c.id), ...catLeafs.map(c => c.id)]
        
        return p.category === filterCat || 
               allRelevantIds.includes(p.category_id) || 
               (p.category_ids && p.category_ids.some((id: string) => allRelevantIds.includes(id)))
      })

  // sort filtered products by sort_order initially
  const sortedProducts = [...filteredProducts].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = sortedProducts.findIndex((p) => p.id === active.id)
      const newIndex = sortedProducts.findIndex((p) => p.id === over.id)
      
      const newItems = arrayMove(sortedProducts, oldIndex, newIndex)
      
      // Preserve absolute sort_order values of the currently filtered items
      const availableSortOrders = sortedProducts.map(p => p.sort_order || 0).sort((a, b) => a - b)
      
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        sort_order: availableSortOrders[index]
      }))
      
      // Update global products list
      const globalUpdatedProducts = products.map(p => {
        const updatedMatch = updatedItems.find(ui => ui.id === p.id)
        return updatedMatch ? updatedMatch : p
      })
      setProducts(globalUpdatedProducts)

      // Save to Supabase (bulk update or sequential)
      // Since supabase JS doesn't have an easy bulk update with different values without a function, 
      // we can do Promise.all or use upsert
      const upsertData = updatedItems.map(item => ({
        id: item.id,
        sort_order: item.sort_order
      }))
      
      // using upsert to update sort_order. We must include all required fields or rely on just updating? 
      // Upsert might require all fields, so we do individual updates for safety or just update what we have.
      // Actually, standard update in a loop:
      Promise.all(upsertData.map(item => 
        supabase.from('products').update({ sort_order: item.sort_order }).eq('id', item.id)
      )).then(() => {
        console.log("Orden actualizado en DB")
      }).catch(err => {
        console.error("Error al reordenar", err)
      })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="font-black text-slate-800 text-lg mb-1">Reordenar Productos (Drag & Drop)</h2>
            <p className="text-xs text-slate-500 font-medium">
              Arrastra los productos usando <GripVertical className="inline size-3.5" /> para cambiar su orden de aparición.
            </p>
          </div>
          
          {categories && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap pl-2">Filtrar por:</span>
              <select 
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold text-blue-900 bg-white"
              >
                <option value="Todos">Todos los productos</option>
                {categories.filter(c => !c.parent_id).map(main => (
                  <optgroup key={main.id} label={main.name}>
                    <option value={main.name}>{main.name} (Todo)</option>
                    {categories.filter(sub => sub.parent_id === main.id).map(sub => (
                      <Fragment key={sub.id}>
                        <option value={sub.name}>&nbsp;&nbsp;↳ {sub.name}</option>
                        {categories.filter(leaf => leaf.parent_id === sub.id).map(leaf => (
                          <option key={leaf.id} value={leaf.name}>&nbsp;&nbsp;&nbsp;&nbsp;↳ {leaf.name}</option>
                        ))}
                      </Fragment>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sortedProducts.map((product, index) => (
                <SortableItem key={product.id} id={product.id} product={product} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

function SortableItem({ id, product, index }: { id: string, product: any, index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 shadow-xs bg-white">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-slate-400 hover:text-blue-500">
        <GripVertical className="size-5" />
      </div>
      <div className="size-10 bg-slate-100 rounded-xl overflow-hidden shrink-0">
        <img src={product.gallery_urls?.[0] || product.image_url || "https://placehold.co/100x100"} alt={product.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-slate-800 text-sm truncate">{product.title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase">Posición: {index + 1}</p>
      </div>
    </div>
  )
}
