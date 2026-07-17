"use client"
import { useState, useEffect, useRef } from "react"
import {
  Camera, Package, Loader2, Lock, DollarSign, RefreshCcw, Wallet, Banknote, Trash2, Pencil,
  Type, Ruler, Info, Search, X, Plus, ChevronDown, Palette, Smartphone, Ticket, User,
  Footprints, Shirt, Star, ShoppingBag, Heart, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2, BookOpen, Gamepad2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import CategoryManager from "@/components/admin/CategoryManager"
import SortableProductList from "@/components/admin/SortableProductList"
import { fetchBCVRate } from "@/lib/bcv"


const ADMIN_PASSWORD = "SUBIBAJA2024"
const CAT_ICONS: Record<string, React.ElementType> = {
  Footprints, Shirt, Star, ShoppingBag, Heart, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2, BookOpen, Gamepad2
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [inventorySearch, setInventorySearch] = useState("")

  const [products, setProducts] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(36.50)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const [formData, setFormData] = useState({
    title: "", price: "", category: "Zapatos", sizes: "",
    image_url: "", stock_quantity: "10", description: "", badge: ""
  })
  const [sizeGroups, setSizeGroups] = useState<{ sizes: string; price: string; color: string; stock: string }[]>([])
  const [selectedSubCat, setSelectedSubCat] = useState<any>(null)
  const [selectedLeafCat, setSelectedLeafCat] = useState<any>(null)
  const [showSubDropdown, setShowSubDropdown] = useState(false)
  const [showLeafDropdown, setShowLeafDropdown] = useState(false)
  const [colors, setColors] = useState<string[]>([])
  const [colorPick, setColorPick] = useState("#8dd5e3")
  const [saleForm, setSaleForm] = useState({
    productId: "", productTitle: "", productCategory: "",
    amount: "", method: "$ Efectivo"
  })
  const [productSearch, setProductSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const [showNewCatForm, setShowNewCatForm] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatIcon, setNewCatIcon] = useState("Tag")
  const [newCatParentId, setNewCatParentId] = useState("")
  const [savingCat, setSavingCat] = useState(false)
  
  // Loyalty and Gift card state variables
  const [customerPhone, setCustomerPhone] = useState("")
  const [loyaltyMembers, setLoyaltyMembers] = useState<any[]>([])
  const [rewardForm, setRewardForm] = useState({ title: "", description: "", pointsRequired: "", image_url: "" })
  const [giftCardForm, setGiftCardForm] = useState({ code: "", balance: "", ownerName: "", ownerPhone: "" })
  const [giftCards, setGiftCards] = useState<any[]>([])
  const [giftCardOrders, setGiftCardOrders] = useState<any[]>([])
  const [savingReward, setSavingReward] = useState(false)
  const [savingGift, setSavingGift] = useState(false)
  const [rewards, setRewards] = useState<any[]>([])
  const [uploadingRewardImg, setUploadingRewardImg] = useState(false)
  const [generatedVoucher, setGeneratedVoucher] = useState<{ id: string, points: number, amount_usd: number } | null>(null)
  const [generatingQr, setGeneratingQr] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const catDropdownRef = useRef<HTMLDivElement>(null)

  const mainCategories = categories.filter(c => !c.parent_id)
  const currentMainCat = categories.find(c => c.name === formData.category && !c.parent_id)
  const subCategories = currentMainCat ? categories.filter(c => c.parent_id === currentMainCat.id) : []
  const leafCategories = selectedSubCat ? categories.filter(c => c.parent_id === selectedSubCat.id) : []

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('adminAuth', 'true')
      fetchInitialData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') === 'true') setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setShowCatDropdown(false)
        setShowSubDropdown(false)
        setShowLeafDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchInitialData() {
    try {
      setLoading(true)
      const rate = await fetchBCVRate()
      setExchangeRate(rate)
      const { data: prods } = await supabase.from('products').select('*').order('sort_order', { ascending: true })
      if (prods) setProducts(prods)
      const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: false })
      if (salesData) setSales(salesData)
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
      if (cats) {
        setCategories(cats)
        if (cats.length > 0 && !formData.category) {
          const mainCats = cats.filter(c => !c.parent_id)
          if (mainCats.length > 0) setFormData(f => ({ ...f, category: mainCats[0].name }))
        }
      }
      
      // Fetch loyalty members and rewards
      const { data: members } = await supabase.from('loyalty_members').select('*').order('created_at', { ascending: false })
      if (members) setLoyaltyMembers(members)
      const { data: rewardsData } = await supabase.from('rewards').select('*').order('created_at', { ascending: false })
      if (rewardsData) setRewards(rewardsData)
      const { data: giftCardsData } = await supabase.from('gift_cards').select('*').order('created_at', { ascending: false })
      if (giftCardsData) setGiftCards(giftCardsData)
      const { data: giftCardOrdersData } = await supabase.from('gift_card_orders').select('*').order('created_at', { ascending: false })
      if (giftCardOrdersData) setGiftCardOrders(giftCardOrdersData)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleSaveReward = async () => {
    if (!rewardForm.title || !rewardForm.pointsRequired || !rewardForm.image_url) { alert("Faltan datos del premio"); return }
    try {
      setSavingReward(true)
      await supabase.from('rewards').insert([{
        title: rewardForm.title,
        description: rewardForm.description,
        points_required: parseInt(rewardForm.pointsRequired),
        image_url: rewardForm.image_url,
        is_active: true
      }])
      setRewardForm({ title: "", description: "", pointsRequired: "", image_url: "" })
      fetchInitialData()
      alert("¡Premio publicado en el catálogo!")
    } catch (err: any) { alert(err.message) } finally { setSavingReward(false) }
  }

  const handleCreateGiftCard = async () => {
    if (!giftCardForm.balance) { alert("Falta ingresar el monto"); return }
    try {
      setSavingGift(true)
      let finalCode = giftCardForm.code.trim().toUpperCase()
      if (!finalCode) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let generated = "SB-"
        for (let i = 0; i < 8; i++) {
          generated += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        finalCode = generated
      }
      await supabase.from('gift_cards').insert([{
        code: finalCode,
        balance: parseFloat(giftCardForm.balance),
        initial_value: parseFloat(giftCardForm.balance),
        is_active: true,
        owner_name: giftCardForm.ownerName.trim() || null,
        owner_phone: giftCardForm.ownerPhone.trim() || null
      }])
      setGiftCardForm({ code: "", balance: "", ownerName: "", ownerPhone: "" })
      fetchInitialData()
      alert("¡Tarjeta de regalo creada con éxito!")
    } catch (err: any) { alert(err.message) } finally { setSavingGift(false) }
  }

  const generateRandomGiftCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = "SB-"
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGiftCardForm({ ...giftCardForm, code })
  }

  const handleRewardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploadingRewardImg(true)
      const fileName = `rewards_${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`products/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${fileName}`)
      setRewardForm(prev => ({ ...prev, image_url: data.publicUrl }))
    } catch (err: any) {
      alert(err.message || 'Error al subir imagen del premio')
    } finally {
      setUploadingRewardImg(false)
    }
  }

  async function handleSaveCategory() {
    if (!newCatName.trim()) return
    try {
      setSavingCat(true)
      const insertData: any = { name: newCatName.trim(), icon: newCatIcon }
      if (newCatParentId) insertData.parent_id = newCatParentId
      await supabase.from('categories').insert([insertData])
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
      if (cats) setCategories(cats)
      if (!newCatParentId) {
        setFormData(f => ({ ...f, category: newCatName.trim() }))
        setSelectedSubCat(null)
        setSelectedLeafCat(null)
                      setSelectedCategoryIds([])
      }
      setNewCatName("")
      setNewCatIcon("Tag")
      setNewCatParentId("")
      setShowNewCatForm(false)
    } catch (err: any) { alert(err.message) } finally { setSavingCat(false) }
  }

  const updateExchangeRate = async (val: string) => {
    const rate = parseFloat(val) || 0
    setExchangeRate(rate)
    await supabase.from('settings').update({ value: rate }).eq('id', 'exchange_rate')
  }

  const selectProduct = (p: any) => {
    setSaleForm({ ...saleForm, productId: p.id, productTitle: p.title, productCategory: p.category, amount: p.price.toString() })
    setProductSearch(p.title)
    setShowDropdown(false)
  }

  const clearProductSelection = () => {
    setSaleForm({ ...saleForm, productId: "", productTitle: "", productCategory: "", amount: "" })
    setProductSearch("")
  }

  const handleRegisterSale = async () => {
    if (!saleForm.amount) return
    try {
      const amountUsd = parseFloat(saleForm.amount)
      await supabase.from('sales').insert([{
        amount_usd: amountUsd,
        amount_bs: amountUsd * exchangeRate,
        payment_method: saleForm.method,
        exchange_rate: exchangeRate,
        product_id: saleForm.productId || null,
        product_title: saleForm.productTitle || null,
        category: saleForm.productCategory || null,
      }])
      if (saleForm.productId) {
        const prod = products.find(p => p.id === saleForm.productId)
        if (prod) {
          const newQty = Math.max(0, (prod.stock_quantity || 0) - 1)
          await supabase.from('products').update({
            stock_quantity: newQty,
            stock_status: newQty === 0 ? 'out_of_stock' : 'in_stock'
          }).eq('id', saleForm.productId)
        }
      }

      // Award points if customer is registered in loyalty club
      if (customerPhone.trim()) {
        const cleanPhone = customerPhone.trim()
        const { data: member } = await supabase.from('loyalty_members').select('*').eq('phone', cleanPhone).single()
        if (member) {
          const pointsEarned = Math.round(amountUsd)
          await supabase.from('loyalty_members').update({ points: member.points + pointsEarned }).eq('id', member.id)
          alert(`¡Venta registrada! Se sumaron ${pointsEarned} puntos al programa VIP de ${member.name}.`)
        } else {
          alert("Venta registrada. El teléfono ingresado no está registrado en el programa Clientes VIP.")
        }
      }

      setSaleForm({ productId: "", productTitle: "", productCategory: "", amount: "", method: "$ Efectivo" })
      setCustomerPhone("")
      setProductSearch("")
      fetchInitialData()
    } catch (err) { console.error(err) }
  }

  const handleRegisterSaleAndGenerateQr = async () => {
    if (!saleForm.amount) return
    try {
      setGeneratingQr(true)
      const amountUsd = parseFloat(saleForm.amount)
      const points = Math.round(amountUsd)
      
      // 1. Registrar venta
      const { error: saleError } = await supabase.from('sales').insert([{
        amount_usd: amountUsd,
        amount_bs: amountUsd * exchangeRate,
        payment_method: saleForm.method,
        exchange_rate: exchangeRate,
        product_id: saleForm.productId || null,
        product_title: saleForm.productTitle || null,
        category: saleForm.productCategory || null,
      }])

      if (saleError) throw saleError

      // 2. Descontar stock
      if (saleForm.productId) {
        const prod = products.find(p => p.id === saleForm.productId)
        if (prod) {
          const newQty = Math.max(0, (prod.stock_quantity || 0) - 1)
          await supabase.from('products').update({
            stock_quantity: newQty,
            stock_status: newQty === 0 ? 'out_of_stock' : 'in_stock'
          }).eq('id', saleForm.productId)
        }
      }

      // 3. Generar Voucher QR
      const { data: voucherData, error: voucherError } = await supabase.from('points_vouchers').insert([{
        points: points,
        amount_usd: amountUsd,
        is_used: false
      }]).select().single()

      if (voucherError) throw voucherError

      setGeneratedVoucher({
        id: voucherData.id,
        points: voucherData.points,
        amount_usd: amountUsd
      })

      // Reset form
      setSaleForm({ productId: "", productTitle: "", productCategory: "", amount: "", method: "$ Efectivo" })
      setCustomerPhone("")
      setProductSearch("")
      fetchInitialData()
    } catch (err: any) { 
      console.error(err)
      alert("Error al registrar venta y generar QR: " + err.message)
    } finally {
      setGeneratingQr(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`products/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${fileName}`)
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }))
    } catch (err: any) {
      alert(err.message || 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files
      if (!files || files.length === 0) return
      setUploadingGallery(true)
      
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = `${Date.now()}_gallery_${i}.${file.name.split('.').pop()}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`products/${fileName}`, file)
        if (uploadError) throw uploadError
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(`products/${fileName}`)
        newUrls.push(data.publicUrl)
      }
      setGalleryUrls(prev => [...prev, ...newUrls])
    } catch (err: any) {
      alert(err.message || 'Error al subir imágenes de galería')
    } finally {
      setUploadingGallery(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleStartEditProduct = (p: any) => {
    setEditingProductId(p.id)
    
    // Set form fields
    setFormData({
      title: p.title || "",
      price: p.price ? p.price.toString() : "",
      category: p.category || "Zapatos",
      sizes: p.sizes ? p.sizes.join(", ") : "",
      image_url: p.image_url || "",
      stock_quantity: p.stock_quantity ? p.stock_quantity.toString() : "10",
      description: p.description || "",
      badge: p.badge || ""
    })
    
    // Reconstruct size groups from prices_by_size if it's formatted
    const reconstructedGroups: { sizes: string; price: string; color: string; stock: string }[] = []
    
    if (p.prices_by_size && Object.keys(p.prices_by_size).length > 0) {
      const pricesMap: Record<string, string[]> = {}
      Object.keys(p.prices_by_size).forEach(k => {
        const val = p.prices_by_size[k]
        if (k.includes('_')) {
          const [sz, col] = k.split('_')
          const key = `${val}_${col}`
          if (!pricesMap[key]) pricesMap[key] = []
          if (!pricesMap[key].includes(sz)) pricesMap[key].push(sz)
        } else {
          const key = `${val}_`
          if (!pricesMap[key]) pricesMap[key] = []
          if (!pricesMap[key].includes(k)) pricesMap[key].push(k)
        }
      })
      
      Object.keys(pricesMap).forEach(key => {
        const [price, col] = key.split('_')
        const sizes = pricesMap[key].sort((a,b) => parseInt(a) - parseInt(b)).join(", ")
        reconstructedGroups.push({
          sizes,
          price,
          color: col || "",
          stock: ""
        })
      })
    }
    setSizeGroups(reconstructedGroups)
    
    // Set colors & gallery
    setSelectedCategoryIds(p.category_ids || (p.category_id ? [p.category_id] : []))
    setColors(p.colors || [])
    setGalleryUrls(p.gallery_urls || [])
    
    // Resolve category hierarchy
    if (p.category_id) {
      const cat = categories.find(c => c.id === p.category_id)
      if (cat) {
        if (cat.parent_id) {
          const parent = categories.find(c => c.id === cat.parent_id)
          if (parent) {
            if (parent.parent_id) {
              const main = categories.find(c => c.id === parent.parent_id)
              if (main) {
                setFormData(prev => ({ ...prev, category: main.name }))
                setSelectedSubCat(parent)
                setSelectedLeafCat(cat)
              }
            } else {
              setFormData(prev => ({ ...prev, category: parent.name }))
              setSelectedSubCat(cat)
              setSelectedLeafCat(null)
                      setSelectedCategoryIds([])
            }
          }
        } else {
          setFormData(prev => ({ ...prev, category: cat.name }))
          setSelectedSubCat(null)
          setSelectedLeafCat(null)
                      setSelectedCategoryIds([])
        }
      }
    } else {
      setSelectedSubCat(null)
      setSelectedLeafCat(null)
                      setSelectedCategoryIds([])
    }
    
    // Switch to upload tab
    setActiveTab("upload")
  }

  const getSelectedCategoryId = () => {
    if (selectedLeafCat) return selectedLeafCat.id
    if (selectedSubCat) return selectedSubCat.id
    const mainCat = categories.find(c => c.name === formData.category && !c.parent_id)
    return mainCat ? mainCat.id : null
  }

  const handleSaveProduct = async () => {
    const activeGroups = sizeGroups.filter(g => g.sizes.trim() && g.price.trim())
    const hasBasePrice = !!formData.price.trim()
    const hasBaseSizes = !!formData.sizes.trim()
    
    if (!formData.title || !formData.image_url) { alert("Faltan datos (título o foto principal)"); return }
    if (!hasBasePrice && activeGroups.length === 0) { alert("Debes ingresar un precio base o al menos un grupo de precios por talla"); return }

    try {
      setSaving(true)
      
      let finalPrice = parseFloat(formData.price) || 0
      let finalSizes: string[] = formData.sizes.split(',').map(s => s.trim()).filter(Boolean)
      const pricesBySizesObj: Record<string, number> = {}
      const stockBySizesObj: Record<string, number> = {}

      // Procesar grupos de tallas si existen
      if (activeGroups.length > 0) {
        const groupSizes: string[] = []
        activeGroups.forEach(g => {
          const groupPrice = parseFloat(g.price) || 0
          const sizesInGroup = g.sizes.split(',').map(s => s.trim()).filter(Boolean)
          sizesInGroup.forEach(s => {
            if (!groupSizes.includes(s)) {
              groupSizes.push(s)
            }
            
            const groupStock = parseInt(g.stock) || 0
            if (g.color) {
              pricesBySizesObj[`${s}_${g.color.toLowerCase()}`] = groupPrice
              if (g.stock) stockBySizesObj[`${s}_${g.color.toLowerCase()}`] = groupStock
            } else {
              pricesBySizesObj[s] = groupPrice
              if (g.stock) stockBySizesObj[s] = groupStock
              colors.forEach(c => {
                pricesBySizesObj[`${s}_${c.toLowerCase()}`] = groupPrice
                if (g.stock) stockBySizesObj[`${s}_${c.toLowerCase()}`] = groupStock
              })
            }
          })
        })
        
        // Si no se especificaron tallas en el input principal, usar la unión de las tallas de los grupos
        if (finalSizes.length === 0) {
          finalSizes = groupSizes
        }
        
        // Si el precio base está vacío, usar el precio del primer grupo como base
        if (!finalPrice && activeGroups[0]) {
          finalPrice = parseFloat(activeGroups[0].price) || 0
        }
      }

      if (editingProductId) {
        const { error } = await supabase.from('products').update({
          title: formData.title,
          price: finalPrice,
          category: formData.category,
          category_id: getSelectedCategoryId(),
          image_url: formData.image_url,
          description: formData.description.trim() || null,
          sizes: finalSizes,
          colors,
          stock_quantity: parseInt(formData.stock_quantity),
          gallery_urls: galleryUrls,
          prices_by_size: pricesBySizesObj,
          category_ids: selectedCategoryIds,
          stock_by_size: stockBySizesObj,
          badge: formData.badge || null
        }).eq('id', editingProductId)
        if (error) throw error
        alert("¡Producto actualizado con éxito!")
      } else {
        const { error } = await supabase.from('products').insert([{
          title: formData.title,
          price: finalPrice,
          category: formData.category,
          category_id: getSelectedCategoryId(),
          image_url: formData.image_url,
          description: formData.description.trim() || null,
          sizes: finalSizes,
          colors,
          stock_quantity: parseInt(formData.stock_quantity), stock_status: 'in_stock',
          gallery_urls: galleryUrls,
          prices_by_size: pricesBySizesObj,
          category_ids: selectedCategoryIds,
          stock_by_size: stockBySizesObj,
          badge: formData.badge || null
        }])
        if (error) throw error
        alert("¡Producto creado con éxito!")
      }
      
      setFormData({ title: "", price: "", category: "Zapatos", sizes: "", image_url: "", stock_quantity: "10", description: "", badge: "" })
      setSizeGroups([])
      setSelectedSubCat(null)
      setSelectedLeafCat(null)
                      setSelectedCategoryIds([])
      setColors([])
      setColorPick("#8dd5e3")
      setGalleryUrls([])
      setEditingProductId(null)
      fetchInitialData()
      setActiveTab("inventory")
    } catch (err: any) { alert(err.message) } finally { setSaving(false) }
  }

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el producto "${title}"?`)) {
      return
    }
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      alert(`Producto "${title}" eliminado con éxito.`)
      fetchInitialData()
    } catch (err: any) {
      alert("Error al eliminar producto: " + err.message)
    }
  }

  const kpis = {
    totalUsd: sales.reduce((acc, s) => acc + Number(s.amount_usd), 0),
    cash: sales.filter(s => s.payment_method === '$ Efectivo').reduce((acc, s) => acc + Number(s.amount_usd), 0),
    zelle: sales.filter(s => s.payment_method === 'Zelle').reduce((acc, s) => acc + Number(s.amount_usd), 0),
    pagoMovil: sales.filter(s => s.payment_method === 'Pago Móvil (Bs)').reduce((acc, s) => acc + Number(s.amount_bs), 0),
  }

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) && p.stock_status === 'in_stock'
  ).slice(0, 6)

  // ── LOGIN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-[40px] shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#8dd5e3' }}>
              <Lock className="text-blue-900 size-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-['Poppins']">Business OS</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (password === ADMIN_PASSWORD) setIsAuthenticated(true); else alert("Contraseña incorrecta") }} className="space-y-4">
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl text-center text-lg bg-slate-50 border-0" />
            <button type="submit" className="w-full rounded-full font-bold tracking-widest text-blue-900" style={{ height: '44px', backgroundColor: '#8dd5e3' }}>
              ENTRAR
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Lato',sans-serif] pb-24">

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-2xl sticky top-0 z-40 px-6 py-4 border-b border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Administración</p>
            <h1 className="text-xl font-black text-slate-900 font-['Poppins']">Subibaja OS</h1>
          </div>
          <div className="px-3 py-1.5 rounded-2xl border border-emerald-100 flex items-center gap-1.5" style={{ backgroundColor: '#d1fae580' }}>
            <RefreshCcw className="w-3 h-3 text-emerald-600 animate-spin-slow" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">BCV Auto: {exchangeRate} Bs</span>
          </div>
        </div>
        <div className="bg-slate-100/80 p-1 rounded-2xl flex flex-wrap gap-1">
          {['dashboard', 'inventory', 'upload', 'categories', 'organize', 'club'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[70px] py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>
              {tab === 'dashboard' ? 'Ventas' : tab === 'inventory' ? 'Stock' : tab === 'upload' ? 'Cargar' : tab === 'categories' ? 'Cats' : tab === 'organize' ? 'Orden' : 'Club'}
            </button>
          ))}
          <Link href="/admin/dashboard" className="flex-1 min-w-[70px]">
            <button className="w-full py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest text-blue-900"
              style={{ backgroundColor: '#8dd5e3' }}>
              Panel
            </button>
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* ── TAB VENTAS ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">

            {/* KPIs */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 relative overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Caja Total</p>
              <p className="text-4xl font-black text-slate-900 font-['Poppins']">${kpis.totalUsd.toFixed(2)}</p>
              <DollarSign className="absolute -bottom-4 -right-4 size-32 text-slate-50" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Banknote className="size-4 text-emerald-500 mx-auto mb-1.5" />, label: 'Efectivo', val: `$${kpis.cash.toFixed(2)}` },
                { icon: <RefreshCcw className="size-4 text-sky-500 mx-auto mb-1.5" />, label: 'Zelle', val: `$${kpis.zelle.toFixed(2)}` },
                { icon: <Wallet className="size-4 text-indigo-500 mx-auto mb-1.5" />, label: 'P. Móvil', val: `${kpis.pagoMovil.toFixed(0)} Bs` },
              ].map(k => (
                <div key={k.label} className="bg-white p-3 rounded-[28px] shadow-sm text-center">
                  {k.icon}
                  <p className="text-[8px] font-black text-slate-400 uppercase">{k.label}</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">{k.val}</p>
                </div>
              ))}
            </div>

            {/* Formulario de venta con buscador de producto */}
            <div className="bg-white rounded-[32px] shadow-sm p-5 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrar Venta</p>

              {/* Buscador de producto */}
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowDropdown(true) }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full h-12 rounded-xl bg-slate-50 pl-11 pr-10 text-sm font-medium outline-none border-0 placeholder:text-slate-300"
                  />
                  {productSearch && (
                    <button onClick={clearProductSelection} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="size-4 text-slate-300" />
                    </button>
                  )}
                </div>
                {showDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100">
                    {filteredProducts.map(p => (
                      <button key={p.id} onClick={() => selectProduct(p)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left">
                        <img src={p.image_url} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 line-clamp-1">{p.title}</p>
                          <p className="text-[10px] font-black text-blue-500 mt-0.5">${p.price} · Stock: {p.stock_quantity}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Monto + Método */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                  <Input placeholder="Monto" type="number" value={saleForm.amount}
                    onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-0 font-bold pl-9" />
                </div>
                <Select onValueChange={(v) => setSaleForm({ ...saleForm, method: v ?? "$ Efectivo" })} defaultValue="$ Efectivo">
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 font-bold text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="$ Efectivo">$ Efectivo</SelectItem>
                    <SelectItem value="Zelle">Zelle</SelectItem>
                    <SelectItem value="Pago Móvil (Bs)">P. Móvil (Bs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Teléfono Cliente para Club Puntos */}
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Teléfono Cliente (Opcional - Club Puntos)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-12 rounded-xl bg-slate-50 pl-11 pr-4 text-xs font-semibold outline-none border-0 placeholder:text-slate-300 text-slate-700"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleRegisterSale} 
                  disabled={!saleForm.amount || generatingQr}
                  className="flex-1 rounded-full font-bold tracking-widest text-blue-900 disabled:opacity-40 transition-transform active:scale-95 text-[9px] uppercase cursor-pointer"
                  style={{ height: '44px', backgroundColor: '#8dd5e380' }}
                >
                  Solo Registrar
                </button>
                <button 
                  onClick={handleRegisterSaleAndGenerateQr} 
                  disabled={!saleForm.amount || generatingQr}
                  className="flex-1 rounded-full font-black tracking-widest text-[#1e3a5f] disabled:opacity-40 transition-transform active:scale-95 text-[9px] uppercase flex items-center justify-center gap-1 cursor-pointer"
                  style={{ height: '44px', backgroundColor: '#8dd5e3' }}
                >
                  {generatingQr ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Creando...
                    </>
                  ) : (
                    <>
                      <Ticket className="size-3.5" /> Registrar y QR
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Últimas ventas */}
            {sales.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Últimas ventas</p>
                {sales.slice(0, 8).map(s => (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700 line-clamp-1">{s.product_title || 'Venta manual'}</p>
                      <p className="text-[10px] text-slate-400">{s.payment_method} · {new Date(s.created_at).toLocaleDateString('es-VE')}</p>
                    </div>
                    <p className="text-sm font-black text-blue-900">${Number(s.amount_usd).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB STOCK ── */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="relative mb-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-[20px] border border-slate-200 bg-white shadow-sm font-semibold text-sm focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-slate-300" /></div>
            ) : products.filter(p => p.title.toLowerCase().includes(inventorySearch.toLowerCase())).map(product => (
              <div key={product.id} className="bg-white rounded-[28px] shadow-sm p-4 flex items-center gap-4">
                <img src={product.image_url} className="size-14 rounded-2xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-sm line-clamp-1">{product.title}</h4>
                  <p className="text-xs font-black text-blue-500">${product.price}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {(product.stock_quantity ?? 0) <= 3 && (
                      <span className="animate-pulse bg-red-50 text-rose-500 px-2 py-0.5 rounded-full font-black text-[8px] tracking-wide border border-rose-100">
                        STOCK BAJO
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${(product.stock_quantity || 0) > 3 ? 'bg-sky-50 text-sky-600' : 'bg-orange-50 text-orange-500'}`}>
                      {product.stock_quantity ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={product.stock_status === 'in_stock'} className="scale-75"
                      onCheckedChange={async (v) => {
                        await supabase.from('products').update({ stock_status: v ? 'in_stock' : 'out_of_stock' }).eq('id', product.id)
                        fetchInitialData()
                      }} />
                    <button
                      onClick={() => handleStartEditProduct(product)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Editar producto"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-55/10 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* ── TAB CARGAR ── */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-[40px] shadow-sm">
            <div className="p-7 space-y-7">
              {/* Foto Principal */}
              <div className="space-y-2.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Foto Principal</Label>
                <div className="relative border-2 border-dashed border-slate-100 rounded-[32px] p-10 bg-slate-50 flex flex-col items-center justify-center aspect-video overflow-hidden">
                  {formData.image_url ? (
                    <img src={formData.image_url} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-3xl shadow-sm mb-3"><Camera className="text-blue-400 size-7" /></div>
                      <span className="text-slate-500 font-bold text-sm">Toca para subir foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                  {uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-blue-400 size-8" /></div>}
                </div>
              </div>

              {/* Galería de Fotos Secundarias */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Galería de fotos (Secundarias)</Label>
                  <span className="text-[8px] text-slate-450 font-bold uppercase">Aparecerán en el carrusel</span>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-2xs group bg-slate-50">
                      <img src={url} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1.5 right-1.5 p-1 bg-white/95 text-rose-500 rounded-full shadow-sm active:scale-110 transition-transform cursor-pointer animate-fade-in"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Botón para añadir foto */}
                  <div className="relative aspect-square border border-dashed border-slate-200 hover:border-blue-300 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50/10 cursor-pointer transition-all">
                    <Plus className="size-4 text-slate-400" />
                    <span className="text-[7.5px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Añadir</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploadingGallery}
                    />
                    {uploadingGallery && (
                      <div className="absolute inset-0 bg-white/75 flex items-center justify-center rounded-2xl">
                        <Loader2 className="animate-spin text-blue-400 size-4.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { label: 'Nombre', icon: <Type className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />, key: 'title', placeholder: 'Ej: Zapato Gala', type: 'text' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</Label>
                    <div className="relative">{f.icon}<Input placeholder={f.placeholder} type={f.type} value={(formData as any)[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-bold" /></div>
                  </div>
                ))}

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</Label>
                  <div className="relative">
                    <Info className="absolute left-4 top-4 size-4 text-slate-300" />
                    <textarea placeholder="Detalles del producto..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full min-h-[100px] rounded-2xl bg-slate-50 border-0 pl-12 pt-3.5 font-medium text-sm outline-none resize-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Etiqueta Especial</Label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                    <select
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-bold text-sm text-slate-700 outline-none appearance-none"
                    >
                      <option value="">Ninguna</option>
                      <option value="nuevo">NUEVO (Azul)</option>
                      <option value="top">TOP (Rojo)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio $</Label>
                    <div className="relative"><DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input type="number" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-black" /></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock</Label>
                    <div className="relative"><Package className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-black" /></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tallas (separadas por coma)</Label>
                  <div className="relative"><Ruler className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" /><Input placeholder="24, 25, 26" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-0 pl-12 font-medium" /></div>
                </div>

                {/* Precios Diferenciados por Grupos de Tallas */}
                <div className="space-y-3 bg-slate-50/50 border border-slate-100 rounded-3xl p-5 mt-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-black text-slate-550 uppercase tracking-widest">Precios por Grupos (Opcional)</Label>
                    <button
                      type="button"
                      onClick={() => setSizeGroups([...sizeGroups, { sizes: "", price: "", color: "", stock: "10" }])}
                      className="text-[8px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      + AGREGAR GRUPO
                    </button>
                  </div>
                  
                  {sizeGroups.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-semibold pl-1 leading-normal">
                      No has agregado grupos. Se usará el precio base y la lista de tallas principal.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sizeGroups.map((group, idx) => (
                        <div key={idx} className="flex flex-col gap-3 bg-white p-4.5 rounded-2xl border border-slate-100/80 shadow-2xs">
                          {/* Fila superior: Tallas, Precio y Eliminar */}
                          <div className="flex gap-2.5 items-end">
                            {/* Campo Tallas */}
                            <div className="flex-1 space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Tallas (ej: 30,31,32)</label>
                              <input
                                type="text"
                                placeholder="Ej: 30, 31, 32"
                                value={group.sizes}
                                onChange={(e) => {
                                  const next = [...sizeGroups]
                                  next[idx].sizes = e.target.value
                                  setSizeGroups(next)
                                }}
                                className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold focus:outline-none focus:border-blue-200 transition-colors"
                              />
                            </div>
                            
                            {/* Campo Precio */}
                            <div className="w-24 space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Precio $</label>
                              <div className="relative">
                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-350" />
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={group.price}
                                  onChange={(e) => {
                                    const next = [...sizeGroups]
                                    next[idx].price = e.target.value
                                    setSizeGroups(next)
                                  }}
                                  className="w-full h-9 pl-6 pr-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black focus:outline-none focus:border-blue-200 transition-colors"
                                />
                              </div>
                            </div>

                            {/* Campo Stock */}
                            <div className="w-20 space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Stock</label>
                              <div className="relative">
                                <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-350" />
                                <input
                                  type="number"
                                  placeholder="10"
                                  value={group.stock || ''}
                                  onChange={(e) => {
                                    const next = [...sizeGroups]
                                    next[idx].stock = e.target.value
                                    setSizeGroups(next)
                                  }}
                                  className="w-full h-9 pl-6 pr-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black focus:outline-none focus:border-blue-200 transition-colors"
                                />
                              </div>
                            </div>
                            
                            {/* Botón Eliminar */}
                            <button
                              type="button"
                              onClick={() => setSizeGroups(sizeGroups.filter((_, i) => i !== idx))}
                              className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-100 hover:border-rose-100 transition-all active:scale-90 cursor-pointer flex-shrink-0"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>

                          {/* Fila inferior: Selección de Color */}
                          {colors.length > 0 && (
                            <div className="space-y-1.5 pt-1.5 border-t border-slate-100/50">
                              <label className="text-[8.5px] font-black text-slate-450 uppercase tracking-wider block">Vincular a Color (Opcional)</label>
                              <div className="flex flex-wrap gap-2 items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...sizeGroups]
                                    next[idx].color = ""
                                    setSizeGroups(next)
                                  }}
                                  className={`h-6 px-2.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all flex items-center justify-center border ${
                                    !group.color
                                      ? 'bg-blue-50 text-blue-900 border-blue-200/50 font-black'
                                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  Todos
                                </button>
                                {colors.map(c => {
                                  const isSelected = group.color === c
                                  return (
                                    <button
                                      key={c}
                                      type="button"
                                      onClick={() => {
                                        const next = [...sizeGroups]
                                        next[idx].color = c
                                        setSizeGroups(next)
                                      }}
                                      className={`size-6 rounded-full border transition-all relative flex items-center justify-center ${
                                        isSelected ? 'ring-2 ring-offset-1 ring-blue-500 border-blue-500 scale-110 shadow-sm' : 'border-slate-200 hover:scale-105'
                                      }`}
                                      style={{ backgroundColor: c }}
                                      title={c}
                                    >
                                      {isSelected && (
                                        <div className="size-1.5 rounded-full bg-white shadow-xs mix-blend-difference" />
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colores */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Colores disponibles</Label>
                    <span className="text-[8px] text-slate-450 font-bold uppercase">Haz clic para agregar o eliminar</span>
                  </div>

                  {/* Preajustes Rápidos */}
                  <div className="flex gap-2 items-center flex-wrap px-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Preajustes:</span>
                    {[
                      { hex: '#FFFFFF', name: 'Blanco' },
                      { hex: '#000000', name: 'Negro' },
                      { hex: '#8dd5e3', name: 'Celeste' },
                      { hex: '#FAD2E1', name: 'Rosa' },
                      { hex: '#F5F5DC', name: 'Beige' },
                      { hex: '#FEF08A', name: 'Dorado' },
                      { hex: '#E2E8F0', name: 'Plata' },
                      { hex: '#F87171', name: 'Rojo' },
                    ].map(preset => {
                      const isSelected = colorPick.toLowerCase() === preset.hex.toLowerCase()
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setColorPick(preset.hex)}
                          title={preset.name}
                          className={`size-6 rounded-full border transition-all active:scale-90 cursor-pointer ${
                            isSelected ? 'ring-2 ring-offset-1 ring-blue-500 border-blue-500 scale-105 shadow-sm' : 'border-slate-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        />
                      )
                    })}
                  </div>

                  {/* Selector y Botón Agregar */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-24 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-colors">
                      <Palette className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none z-10" />
                      
                      {/* Círculo de color que muestra la selección actual */}
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm ml-6 flex-shrink-0" style={{ backgroundColor: colorPick }} />
                      
                      {/* Input oculto que abarca todo el botón para abrir el selector nativo al tocar */}
                      <input
                        type="color"
                        value={colorPick}
                        onChange={e => setColorPick(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => { if (!colors.includes(colorPick)) setColors([...colors, colorPick]) }}
                      className="h-14 flex-1 rounded-2xl font-black text-[10px] tracking-[0.12em] transition-all active:scale-95 shadow-xs cursor-pointer"
                      style={{ backgroundColor: '#8dd5e3', color: '#1e3a5f' }}
                    >
                      + AGREGAR COLOR
                    </button>
                  </div>

                  {/* Listado de colores agregados */}
                  {colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1.5 px-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50">
                      {colors.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColors(colors.filter(x => x !== c))}
                          title="Click para eliminar"
                          className="flex items-center gap-2 h-8 pl-2 pr-3.5 rounded-full border bg-white text-[9px] font-black transition-transform active:scale-95 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-3xs cursor-pointer group"
                          style={{ borderColor: c }}
                        >
                          <div className="w-3.5 h-3.5 rounded-full shadow-2xs group-hover:scale-90 transition-transform" style={{ backgroundColor: c }} />
                          <span className="text-slate-500 group-hover:text-rose-600 font-mono text-[8px] uppercase">{c}</span>
                          <X className="size-2.5 text-slate-400 group-hover:text-rose-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* NUEVO MULTI-CATEGORIA UI */}
                <div className="space-y-3 bg-slate-50/50 border border-slate-100 rounded-3xl p-5">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-black text-slate-550 uppercase tracking-widest">Asignar Categorías</Label>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {categories.filter(c => !c.parent_id).map(mainCat => {
                      const mainChecked = selectedCategoryIds.includes(mainCat.id)
                      return (
                        <div key={mainCat.id} className="space-y-1">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-800 hover:bg-slate-50 p-1.5 rounded-lg">
                            <input type="checkbox" checked={mainChecked} onChange={(e) => {
                              if (e.target.checked) setSelectedCategoryIds([...selectedCategoryIds, mainCat.id])
                              else setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== mainCat.id))
                            }} className="size-4 rounded text-blue-500" />
                            {mainCat.name}
                          </label>
                          <div className="pl-6 space-y-1">
                            {categories.filter(sub => sub.parent_id === mainCat.id).map(subCat => {
                              const subChecked = selectedCategoryIds.includes(subCat.id)
                              return (
                                <div key={subCat.id} className="space-y-1">
                                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-600 hover:bg-slate-50 p-1 rounded-lg">
                                    <input type="checkbox" checked={subChecked} onChange={(e) => {
                                      if (e.target.checked) setSelectedCategoryIds([...selectedCategoryIds, subCat.id])
                                      else setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== subCat.id))
                                    }} className="size-3.5 rounded text-blue-500" />
                                    {subCat.name}
                                  </label>
                                  <div className="pl-5 flex flex-wrap gap-2 pt-1">
                                    {categories.filter(leaf => leaf.parent_id === subCat.id).map(leafCat => {
                                      const leafChecked = selectedCategoryIds.includes(leafCat.id)
                                      return (
                                        <label key={leafCat.id} className={`flex items-center gap-1.5 cursor-pointer text-[10px] font-medium border px-2 py-0.5 rounded-full transition-colors ${leafChecked ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                          <input type="checkbox" checked={leafChecked} onChange={(e) => {
                                            if (e.target.checked) setSelectedCategoryIds([...selectedCategoryIds, leafCat.id])
                                            else setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== leafCat.id))
                                          }} className="hidden" />
                                          {leafCat.name}
                                        </label>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* OLD UI (Hiding it) */}
                <div className="hidden">
                    <div className="relative">
                    {/* Trigger */}
                    <button
                      type="button"
                      onClick={() => { setShowCatDropdown(v => !v); setShowNewCatForm(false); setShowSubDropdown(false); setShowLeafDropdown(false) }}
                      className="w-full h-14 rounded-2xl bg-slate-50 px-5 flex items-center justify-between font-bold text-sm text-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const cat = mainCategories.find(c => c.name === formData.category)
                          const IconComp = cat ? (CAT_ICONS[cat.icon] || Tag) : Tag
                          return <><IconComp className="size-4 text-blue-400" /><span>{formData.category || 'Selecciona categoría'}</span></>
                        })()}
                      </div>
                      <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${showCatDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown list */}
                    {showCatDropdown && (
                      <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100">
                        {mainCategories.map(cat => {
                          const IconComp = CAT_ICONS[cat.icon] || Tag
                          return (
                            <button key={cat.id} type="button"
                              onClick={() => {
                                setFormData({ ...formData, category: cat.name });
                                setSelectedSubCat(null);
                                setSelectedLeafCat(null)
                      setSelectedCategoryIds([]);
                                setShowCatDropdown(false);
                              }}
                              className={`w-full px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${formData.category === cat.name ? 'bg-blue-50' : ''}`}
                            >
                              <IconComp className="size-4 text-blue-400 flex-shrink-0" />
                              <span className="text-sm font-bold text-slate-700 flex-1">{cat.name}</span>
                              {formData.category === cat.name && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                            </button>
                          )
                        })}
                        <div className="border-t border-slate-100">
                          <button type="button"
                            onClick={() => { setShowNewCatForm(v => !v); setShowCatDropdown(false) }}
                            className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-blue-500"
                          >
                            <Plus className="size-4 flex-shrink-0" />
                            <span className="text-sm font-bold">Nueva Categoría</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline new-category form */}
                    {showNewCatForm && (
                      <div className="mt-2 bg-white rounded-2xl border border-slate-100 shadow-lg p-4 space-y-4">
                        <input
                          placeholder="Nombre de categoría..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="w-full h-12 rounded-xl bg-slate-50 border-0 px-4 font-bold text-sm outline-none placeholder:text-slate-300"
                        />
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pertenece a (Opcional)</p>
                          <select
                            value={newCatParentId}
                            onChange={(e) => setNewCatParentId(e.target.value)}
                            className="w-full h-11 rounded-xl bg-slate-50 border-0 px-3 font-semibold text-xs text-slate-700 outline-none"
                          >
                            <option value="">Ninguna (Categoría Principal)</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.parent_id ? `  └─ ${c.name}` : c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Elige un icono</p>
                          <div className="grid grid-cols-6 gap-2">
                            {Object.entries(CAT_ICONS).map(([name, IconComp]) => (
                              <button key={name} type="button"
                                onClick={() => setNewCatIcon(name)}
                                className="h-9 rounded-xl flex items-center justify-center transition-all"
                                style={newCatIcon === name
                                  ? { backgroundColor: '#8dd5e3', color: '#1e3a5f' }
                                  : { backgroundColor: '#f8fafc', color: '#cbd5e1' }}
                              >
                                <IconComp className="size-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <button type="button" onClick={handleSaveCategory}
                          disabled={!newCatName.trim() || savingCat}
                          className="w-full h-11 rounded-full font-black tracking-widest text-blue-900 text-[10px] disabled:opacity-40 transition-transform active:scale-95"
                          style={{ backgroundColor: '#8dd5e3' }}>
                          {savingCat ? 'GUARDANDO...' : 'GUARDAR CATEGORÍA'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subcategory Level 2 (OLD UI - HIDDEN) */}
                {currentMainCat && (
                  <div className="space-y-1.5 hidden">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subcategoría</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setShowSubDropdown(v => !v); setShowLeafDropdown(false); setShowCatDropdown(false) }}
                        className="w-full h-14 rounded-2xl bg-slate-50 px-5 flex items-center justify-between font-bold text-sm text-slate-700"
                      >
                        <span className="truncate">{selectedSubCat ? selectedSubCat.name : 'Selecciona subcategoría'}</span>
                        <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${showSubDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showSubDropdown && (
                        <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100 max-h-60 overflow-y-auto">
                          {subCategories.length > 0 ? subCategories.map(sub => (
                            <button key={sub.id} type="button"
                              onClick={() => {
                                setSelectedSubCat(sub);
                                setSelectedLeafCat(null)
                      setSelectedCategoryIds([]);
                                setShowSubDropdown(false);
                              }}
                              className={`w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left ${selectedSubCat?.id === sub.id ? 'bg-blue-50' : ''}`}
                            >
                              <span className="text-sm font-bold text-slate-700">{sub.name}</span>
                              {selectedSubCat?.id === sub.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                            </button>
                          )) : (
                            <div className="px-5 py-3 text-xs text-slate-400 italic">No hay subcategorías</div>
                          )}
                          <div className="border-t border-slate-100">
                            <button type="button"
                              onClick={() => { 
                                setNewCatParentId(currentMainCat.id);
                                setShowNewCatForm(true); 
                                setShowSubDropdown(false); 
                              }}
                              className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-blue-500"
                            >
                              <Plus className="size-4 flex-shrink-0" />
                              <span className="text-sm font-bold">Nueva Subcategoría</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Leaf Category / Type Level 3 (OLD UI - HIDDEN) */}
                {selectedSubCat && (
                  <div className="space-y-1.5 hidden">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Producto</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setShowLeafDropdown(v => !v); setShowSubDropdown(false); setShowCatDropdown(false) }}
                        className="w-full h-14 rounded-2xl bg-slate-50 px-5 flex items-center justify-between font-bold text-sm text-slate-700"
                      >
                        <span className="truncate">{selectedLeafCat ? selectedLeafCat.name : 'Selecciona tipo'}</span>
                        <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${showLeafDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showLeafDropdown && (
                        <div className="absolute z-20 w-full bg-white shadow-xl rounded-2xl mt-1.5 overflow-hidden border border-slate-100 max-h-60 overflow-y-auto">
                          {leafCategories.length > 0 ? leafCategories.map(leaf => (
                            <button key={leaf.id} type="button"
                              onClick={() => {
                                setSelectedLeafCat(leaf);
                                setShowLeafDropdown(false);
                              }}
                              className={`w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left ${selectedLeafCat?.id === leaf.id ? 'bg-blue-50' : ''}`}
                            >
                              <span className="text-sm font-bold text-slate-700">{leaf.name}</span>
                              {selectedLeafCat?.id === leaf.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                            </button>
                          )) : (
                            <div className="px-5 py-3 text-xs text-slate-400 italic">No hay tipos</div>
                          )}
                          <div className="border-t border-slate-100">
                            <button type="button"
                              onClick={() => { 
                                setNewCatParentId(selectedSubCat.id);
                                setShowNewCatForm(true); 
                                setShowLeafDropdown(false); 
                              }}
                              className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-blue-500"
                            >
                              <Plus className="size-4 flex-shrink-0" />
                              <span className="text-sm font-bold">Nuevo Tipo</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 w-full">
                {editingProductId && (
                  <button
                    onClick={() => {
                      setFormData({ title: "", price: "", category: "Zapatos", sizes: "", image_url: "", stock_quantity: "10", description: "", badge: "" })
                      setSizeGroups([])
                      setSelectedSubCat(null)
                      setSelectedLeafCat(null)
                      setSelectedCategoryIds([])
                      setColors([])
                      setColorPick("#8dd5e3")
                      setGalleryUrls([])
                      setEditingProductId(null)
                      setActiveTab("inventory")
                    }}
                    className="flex-1 rounded-full font-black tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-transform active:scale-95 text-[10px] uppercase border border-slate-200"
                    style={{ height: '56px' }}
                  >
                    Cancelar
                  </button>
                )}
                <button onClick={handleSaveProduct} disabled={saving || uploading}
                  className={`${editingProductId ? 'flex-2' : 'w-full'} rounded-full font-black tracking-widest text-blue-900 disabled:opacity-40 transition-transform active:scale-95`}
                  style={{ height: '56px', backgroundColor: '#8dd5e3', fontSize: '12px' }}>
                  {saving ? 'GUARDANDO...' : editingProductId ? 'GUARDAR CAMBIOS' : 'CARGAR PRODUCTO'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CLUB ── */}
        {activeTab === 'categories' && (
          <CategoryManager categories={categories} setCategories={setCategories} supabase={supabase} />
        )}

        {activeTab === 'organize' && (
          <SortableProductList products={products} setProducts={setProducts} supabase={supabase} />
        )}

        {activeTab === 'club' && (
          <div className="space-y-6 animate-fade-in">

            {/* Generar Tarjeta de Regalo */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Ticket className="size-5 text-blue-400" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Generar Tarjeta de Regalo</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350" />
                    <Input
                      placeholder="Código (Ej: SB-REGALO-100)"
                      value={giftCardForm.code}
                      onChange={(e) => setGiftCardForm({ ...giftCardForm, code: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-0 pl-11 font-mono font-bold text-xs uppercase"
                    />
                  </div>
                  <button
                    onClick={generateRandomGiftCode}
                    className="px-3 rounded-xl border border-slate-200 text-[10px] font-black tracking-wider uppercase text-slate-505 hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                  >
                    🎲 Aleatorio
                  </button>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350" />
                  <Input
                    placeholder="Monto USD inicial"
                    type="number"
                    value={giftCardForm.balance}
                    onChange={(e) => setGiftCardForm({ ...giftCardForm, balance: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-0 pl-11 font-black text-xs"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                  <Input
                    placeholder="Nombre del Cliente (Dueño)"
                    value={giftCardForm.ownerName}
                    onChange={(e) => setGiftCardForm({ ...giftCardForm, ownerName: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-0 pl-11 text-xs font-semibold text-slate-700"
                  />
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                  <Input
                    placeholder="Teléfono del Cliente (Dueño)"
                    value={giftCardForm.ownerPhone}
                    onChange={(e) => setGiftCardForm({ ...giftCardForm, ownerPhone: e.target.value })}
                    className="h-12 rounded-xl bg-slate-50 border-0 pl-11 text-xs font-semibold text-slate-700"
                  />
                </div>
                <button
                  onClick={handleCreateGiftCard}
                  disabled={savingGift || !giftCardForm.balance}
                  className="w-full h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm active:scale-95 disabled:opacity-50 transition-transform cursor-pointer"
                  style={{ backgroundColor: '#8dd5e3' }}
                >
                  {savingGift ? 'GENERANDO...' : 'CREAR TARJETA DE REGALO'}
                </button>
              </div>
            </div>

            {/* Listado de Tarjetas de Regalo */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tarjetas de Regalo ({giftCards.length})</p>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-slate-300" /></div>
              ) : giftCards.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center text-slate-350 text-xs font-bold">No hay tarjetas de regalo creadas aún</div>
              ) : (
                giftCards.map(gc => (
                  <div key={gc.id} className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-800 tracking-wide">{gc.code}</span>
                        {!gc.is_active && (
                          <span className="bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Inactiva</span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate font-bold">
                        {gc.owner_name ? `Dueño: ${gc.owner_name}` : 'Sin dueño asignado'}
                        {gc.owner_phone ? ` (${gc.owner_phone})` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-blue-900 font-['Poppins']">${Number(gc.balance).toFixed(2)}</span>
                      <span className="text-[7px] text-slate-400 block font-bold">inicial: ${Number(gc.initial_value).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pedidos de Gift Cards */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pedidos de Gift Cards ({giftCardOrders.length})</p>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-slate-300" /></div>
              ) : giftCardOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center text-slate-350 text-xs font-bold">No hay pedidos pendientes aún</div>
              ) : (
                giftCardOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between border border-slate-100 hover:border-blue-100">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-700">{order.name}</p>
                        {order.status === 'pending' ? (
                          <span className="bg-amber-50/80 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">Pendiente</span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">Creado</span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate font-medium">
                        {order.phone} · {order.email}
                      </p>
                      <p className="text-[8px] text-slate-350 font-bold mt-1">
                        Pedido el {new Date(order.created_at).toLocaleDateString('es-VE')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="text-sm font-black text-blue-900 font-['Poppins']">${Number(order.amount).toFixed(0)}</span>
                      {order.status === 'pending' && (
                        <button
                          onClick={async () => {
                            // Populate Generator Inputs
                            setGiftCardForm({
                              code: `SB-GIFT-${order.amount}-${Math.floor(1000 + Math.random() * 9000)}`,
                              balance: order.amount.toString(),
                              ownerName: order.name,
                              ownerPhone: order.phone
                            });
                            // Mark order as completed
                            await supabase.from('gift_card_orders').update({ status: 'completed' }).eq('id', order.id);
                            fetchInitialData();
                            // Scroll to top of page
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className="bg-[#8dd5e3]/40 border border-[#8dd5e3]/60 text-blue-900 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                        >
                          Procesar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Registrar Premio del Club */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="size-5 text-blue-400" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Publicar Premio del Club</h3>
              </div>
              <div className="space-y-4">
                {/* Reward Image Upload */}
                <div className="relative border-2 border-dashed border-slate-100 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center aspect-video overflow-hidden">
                  {rewardForm.image_url ? (
                    <img src={rewardForm.image_url} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="bg-white p-3 rounded-2xl shadow-xs mb-2"><Camera className="text-blue-400 size-5" /></div>
                      <span className="text-slate-400 font-bold text-xs">Foto del Premio</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleRewardImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingRewardImg} />
                  {uploadingRewardImg && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin text-blue-400 size-6" /></div>}
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                    <Input
                      placeholder="Título del Premio (Ej: Lazo de regalo)"
                      value={rewardForm.title}
                      onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-0 pl-11 text-xs font-semibold text-slate-700"
                    />
                  </div>
                  <div className="relative">
                    <Info className="absolute left-4 top-4 size-4 text-slate-350 pointer-events-none" />
                    <textarea
                      placeholder="Descripción / Restricciones del premio"
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                      className="w-full min-h-[80px] rounded-xl bg-slate-50 border-0 pl-11 pt-3.5 text-xs font-medium outline-none resize-none placeholder:text-slate-400 text-slate-750"
                    />
                  </div>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                    <Input
                      placeholder="Puntos requeridos (Ej: 100)"
                      type="number"
                      value={rewardForm.pointsRequired}
                      onChange={(e) => setRewardForm({ ...rewardForm, pointsRequired: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 border-0 pl-11 text-xs font-black text-slate-700"
                    />
                  </div>
                  <button
                    onClick={handleSaveReward}
                    disabled={savingReward || uploadingRewardImg || !rewardForm.title || !rewardForm.pointsRequired || !rewardForm.image_url}
                    className="w-full h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm active:scale-95 disabled:opacity-50 transition-transform cursor-pointer"
                    style={{ backgroundColor: '#8dd5e3' }}
                  >
                    {savingReward ? 'PUBLICANDO...' : 'PUBLICAR PREMIO'}
                  </button>
                </div>
              </div>
            </div>

            {/* Listado de Miembros del Club */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Miembros del Club ({loyaltyMembers.length})</p>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-slate-300" /></div>
              ) : loyaltyMembers.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center text-slate-350 text-xs font-bold">No hay miembros registrados aún</div>
              ) : (
                loyaltyMembers.map(m => (
                  <div key={m.id} className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between border border-slate-100/55 hover:border-blue-100">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-slate-700">{m.name}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-bold">{m.phone} · Unido el {new Date(m.created_at).toLocaleDateString('es-VE')}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            const personalLink = `${window.location.origin}/puntos?phone=${m.phone}`
                            navigator.clipboard.writeText(personalLink)
                            alert("¡Enlace copiado al portapapeles!")
                          }}
                          className="text-[8px] font-black tracking-wider text-blue-900 bg-blue-50/50 hover:bg-[#8dd5e3]/35 px-2 py-1 rounded border border-blue-100/20 transition-all active:scale-95 cursor-pointer uppercase"
                        >
                          Copiar Enlace
                        </button>
                        <button
                          onClick={() => {
                            const personalLink = `${window.location.origin}/puntos?phone=${m.phone}`
                            const msg = `¡Hola ${m.name}! Te compartimos tu enlace personal para consultar tus puntos acumulados y ver los premios disponibles en el Club VIP de Subibaja: ${personalLink}`
                            let cleanPhone = m.phone.replace(/[^0-9]/g, '');
                            if (cleanPhone.startsWith('0')) {
                              cleanPhone = '58' + cleanPhone.substring(1);
                            }
                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank')
                          }}
                          className="text-[8px] font-black tracking-wider text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/50 px-2 py-1 rounded border border-emerald-100/20 transition-all active:scale-95 cursor-pointer uppercase"
                        >
                          Enviar WhatsApp
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#8dd5e340] border border-[#8dd5e380] px-3 py-1 rounded-xl text-center flex-shrink-0">
                      <span className="text-xs font-black text-blue-900 font-['Poppins']">{m.points}</span>
                      <span className="text-[7px] font-black text-blue-800 uppercase block tracking-wider font-bold">PTS</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>

      {/* Modal QR Code de Puntos */}
      {generatedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setGeneratedVoucher(null)}
          />
          <div className="relative w-full max-w-[380px] bg-white rounded-[32px] overflow-hidden shadow-2xl p-6 border border-slate-100 flex flex-col gap-4 text-center z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-10">
            <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 relative shadow-sm border border-blue-100/30">
              <Crown className="size-6 fill-blue-100 text-blue-900" />
              <Sparkles className="size-4 text-amber-400 fill-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black tracking-widest text-[#8dd5e3] bg-blue-900 px-3 py-1 rounded-full uppercase inline-block">Código QR de Puntos</span>
              <h3 className="text-sm font-black text-blue-900 font-['Poppins'] tracking-tight mt-2 uppercase">
                ¡Escanea para acumular!
              </h3>
              <p className="text-[11px] text-slate-405 font-bold">
                Compra de ${generatedVoucher.amount_usd.toFixed(2)} USD = {generatedVoucher.points} Puntos
              </p>
            </div>

            {/* QR Image Container */}
            <div className="mx-auto bg-slate-50 p-4 rounded-3xl border border-slate-100/80 shadow-inner flex items-center justify-center w-64 h-64">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  `${window.location.origin}/puntos?claim=${generatedVoucher.id}`
                )}`}
                alt="QR Points Voucher"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <p className="text-[9px] text-slate-400 leading-normal font-semibold px-4">
              El cliente debe escanear este código con su celular para sumar los puntos a su cuenta VIP o registrarse.
            </p>

            <button
              onClick={() => setGeneratedVoucher(null)}
              className="w-full h-11 rounded-full font-black tracking-widest text-blue-900 text-[10px] uppercase shadow-sm transition-transform active:scale-95 flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: '#8dd5e3' }}
            >
              Cerrar y Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
