"use client"
import React, { useState, useEffect, useRef } from "react"
import {
  Camera, Package, Loader2, Lock, DollarSign, RefreshCcw, Wallet, Banknote, Trash2, Pencil,
  Type, Ruler, Info, Search, X, Plus, ChevronDown, ChevronUp, Image as ImageIcon, Palette, Smartphone, Ticket, User,
  Footprints, Shirt, Star, ShoppingBag, Heart, Baby, Gift, Crown, Sparkles, Gem, Tag, Flower2, BookOpen, Gamepad2,
  Copy, ExternalLink, MessageCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { revalidateStorefront } from "@/lib/revalidate"
import CategoryManager from "@/components/admin/CategoryManager"
import SortableProductList from "@/components/admin/SortableProductList"
import { fetchBCVRate } from "@/lib/bcv"

const InstagramIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

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
  const [giftCardForm, setGiftCardForm] = useState({ code: "", title: "", description: "", balance: "", image_url: "", ownerName: "", ownerPhone: "" })
  const [giftCards, setGiftCards] = useState<any[]>([])
  const [giftCardOrders, setGiftCardOrders] = useState<any[]>([])
  const [savingReward, setSavingReward] = useState(false)
  const [savingGift, setSavingGift] = useState(false)
  const [editingGiftCard, setEditingGiftCard] = useState<any | null>(null)
  const [uploadingGiftCardId, setUploadingGiftCardId] = useState<string | null>(null)
  const [uploadingGiftImg, setUploadingGiftImg] = useState(false)
  const [showNewGiftCardForm, setShowNewGiftCardForm] = useState(false)
  const [rewards, setRewards] = useState<any[]>([])
  const [uploadingRewardImg, setUploadingRewardImg] = useState(false)
  const [editingReward, setEditingReward] = useState<any | null>(null)
  const [uploadingRewardId, setUploadingRewardId] = useState<string | null>(null)
  const [showNewRewardForm, setShowNewRewardForm] = useState(false)
  const [generatedVoucher, setGeneratedVoucher] = useState<{ id: string, points: number, amount_usd: number, phone?: string } | null>(null)
  const [generatingQr, setGeneratingQr] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  // Banners carousel state
  const [banners, setBanners] = useState<any[]>([])
  const [bannerSection, setBannerSection] = useState<'hero' | 'middle' | 'instagram'>('hero')
  const [newBannerTitle, setNewBannerTitle] = useState("")
  const [newBannerImage, setNewBannerImage] = useState("")
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)

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
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
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

      // Fetch banners for carousel
      const { data: bannersData } = await supabase.from('banners').select('*').order('sort_order', { ascending: true })
      if (bannersData) setBanners(bannersData)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleSaveReward = async () => {
    if (!rewardForm.title || !rewardForm.pointsRequired) { alert("Faltan datos del premio (título y puntos requeridos)"); return }
    try {
      setSavingReward(true)
      await supabase.from('rewards').insert([{
        title: rewardForm.title,
        description: rewardForm.description,
        points_required: parseInt(rewardForm.pointsRequired),
        image_url: rewardForm.image_url || '/logo-principal.jpg',
        is_active: true
      }])
      setRewardForm({ title: "", description: "", pointsRequired: "", image_url: "" })
      setShowNewRewardForm(false)
      fetchInitialData()
      alert("¡Premio publicado en el catálogo!")
    } catch (err: any) { alert(err.message) } finally { setSavingReward(false) }
  }

  const handleUpdateRewardImage = async (rewardId: string, file: File) => {
    try {
      setUploadingRewardId(rewardId)
      const fileName = `rewards_${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`products/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${fileName}`)
      const newUrl = data.publicUrl
      const { error: updateError } = await supabase
        .from('rewards')
        .update({ image_url: newUrl })
        .eq('id', rewardId)
      if (updateError) throw updateError
      await fetchInitialData()
    } catch (err: any) {
      alert(err.message || 'Error al subir la imagen del premio')
    } finally {
      setUploadingRewardId(null)
    }
  }

  const handleResetRewardToLogo = async (rewardId: string) => {
    try {
      setUploadingRewardId(rewardId)
      const { error } = await supabase
        .from('rewards')
        .update({ image_url: '/logo-principal.jpg' })
        .eq('id', rewardId)
      if (error) throw error
      await fetchInitialData()
    } catch (err: any) {
      alert(err.message || 'Error al restablecer logo')
    } finally {
      setUploadingRewardId(null)
    }
  }

  const handleToggleRewardActive = async (reward: any) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: !reward.is_active })
        .eq('id', reward.id)
      if (error) throw error
      await fetchInitialData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este premio del catálogo?')) return
    try {
      const { error } = await supabase.from('rewards').delete().eq('id', id)
      if (error) throw error
      await fetchInitialData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSaveRewardEdit = async () => {
    if (!editingReward || !editingReward.title || !editingReward.points_required) {
      alert('Faltan datos del premio (título y puntos)');
      return;
    }
    try {
      const { error } = await supabase.from('rewards').update({
        title: editingReward.title,
        description: editingReward.description,
        points_required: parseInt(editingReward.points_required),
        image_url: editingReward.image_url || '/logo-principal.jpg',
        is_active: editingReward.is_active
      }).eq('id', editingReward.id)
      if (error) throw error
      setEditingReward(null)
      await fetchInitialData()
      alert('¡Premio actualizado con éxito!')
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateGiftCard = async () => {
    if (!giftCardForm.balance) { alert("Falta ingresar el monto / precio de la tarjeta"); return }
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
      const balanceNum = parseFloat(giftCardForm.balance)
      await supabase.from('gift_cards').insert([{
        code: finalCode,
        title: giftCardForm.title?.trim() || `Gift Card $${balanceNum} USD`,
        description: giftCardForm.description?.trim() || 'Tarjeta de regalo válida en boutique Subibaja y compras online.',
        balance: balanceNum,
        initial_value: balanceNum,
        image_url: giftCardForm.image_url || '/imagem_gift_card.jpeg',
        is_active: true,
        owner_name: giftCardForm.ownerName.trim() || null,
        owner_phone: giftCardForm.ownerPhone.trim() || null
      }])
      setGiftCardForm({ code: "", title: "", description: "", balance: "", image_url: "", ownerName: "", ownerPhone: "" })
      setShowNewGiftCardForm(false)
      fetchInitialData()
      alert("¡Tarjeta de regalo creada con éxito!")
    } catch (err: any) { alert(err.message) } finally { setSavingGift(false) }
  }

  const handleGiftCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploadingGiftImg(true)
      const fileName = `giftcard_${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`products/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${fileName}`)
      setGiftCardForm(prev => ({ ...prev, image_url: data.publicUrl }))
    } catch (err: any) {
      alert(err.message || 'Error al subir imagen de la tarjeta')
    } finally {
      setUploadingGiftImg(false)
    }
  }

  const handleUpdateGiftCardImage = async (giftCardId: string, file: File) => {
    try {
      setUploadingGiftCardId(giftCardId)
      const fileName = `giftcard_${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`products/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${fileName}`)
      const newUrl = data.publicUrl
      const { error: updateError } = await supabase
        .from('gift_cards')
        .update({ image_url: newUrl })
        .eq('id', giftCardId)
      if (updateError) throw updateError
      await fetchInitialData()
    } catch (err: any) {
      alert(err.message || 'Error al actualizar imagen de la tarjeta')
    } finally {
      setUploadingGiftCardId(null)
    }
  }

  const handleResetGiftCardToLogo = async (giftCardId: string) => {
    try {
      setUploadingGiftCardId(giftCardId)
      const { error } = await supabase
        .from('gift_cards')
        .update({ image_url: '/logo-principal.jpg' })
        .eq('id', giftCardId)
      if (error) throw error
      await fetchInitialData()
    } catch (err: any) {
      alert(err.message || 'Error al restablecer logo')
    } finally {
      setUploadingGiftCardId(null)
    }
  }

  const handleToggleGiftCardActive = async (card: any) => {
    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ is_active: !card.is_active })
        .eq('id', card.id)
      if (error) throw error
      await fetchInitialData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteGiftCard = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta tarjeta de regalo?')) return
    try {
      const { error } = await supabase.from('gift_cards').delete().eq('id', id)
      if (error) throw error
      await fetchInitialData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSaveGiftCardEdit = async () => {
    if (!editingGiftCard || !editingGiftCard.balance) {
      alert('Falta ingresar el monto / precio de la tarjeta');
      return;
    }
    try {
      const balanceNum = parseFloat(editingGiftCard.balance)
      const { error } = await supabase.from('gift_cards').update({
        title: editingGiftCard.title?.trim() || `Gift Card $${balanceNum} USD`,
        description: editingGiftCard.description?.trim() || '',
        code: editingGiftCard.code?.trim().toUpperCase(),
        balance: balanceNum,
        initial_value: balanceNum,
        image_url: editingGiftCard.image_url || '/imagem_gift_card.jpeg',
        is_active: editingGiftCard.is_active,
        owner_name: editingGiftCard.owner_name?.trim() || null,
        owner_phone: editingGiftCard.owner_phone?.trim() || null
      }).eq('id', editingGiftCard.id)
      if (error) throw error
      setEditingGiftCard(null)
      await fetchInitialData()
      alert('¡Tarjeta de regalo actualizada con éxito!')
    } catch (err: any) {
      alert(err.message)
    }
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
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
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
    await supabase.from('settings').upsert({ id: 'exchange_rate', value: rate.toString() })
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
        amount_usd: amountUsd,
        phone: customerPhone ? customerPhone.trim() : ""
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

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploadingBanner(true)
      const fileName = `banner_${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`banners/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(`banners/${fileName}`)
      setNewBannerImage(data.publicUrl)
    } catch (err: any) {
      alert(err.message || 'Error al subir banner')
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleAddBanner = async () => {
    if (!newBannerImage.trim()) {
      alert("Por favor selecciona o sube una imagen para el banner.")
      return
    }
    try {
      setSavingBanner(true)
      const currentList = banners.filter(b => (
        bannerSection === 'instagram' ? b.position === 'instagram' :
        bannerSection === 'middle' ? b.position === 'middle' :
        (b.position || 'hero') === 'hero'
      ))
      const maxSort = currentList.reduce((max, b) => Math.max(max, b.sort_order || 0), 0)
      const { data, error } = await supabase.from('banners').insert([{
        title: newBannerTitle.trim() || `Banner ${currentList.length + 1}`,
        image_url: newBannerImage.trim(),
        sort_order: maxSort + 1,
        is_active: true,
        position: bannerSection
      }]).select().single()

      if (error) throw error
      if (data) {
        setBanners(prev => [...prev, data])
      }
      setNewBannerTitle("")
      setNewBannerImage("")
      await revalidateStorefront()
      alert("¡Imagen añadida exitosamente!")
    } catch (err: any) {
      alert(err.message || 'Error al guardar banner')
    } finally {
      setSavingBanner(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta imagen?")) return
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) throw error
      setBanners(prev => prev.filter(b => b.id !== id))
      await revalidateStorefront()
    } catch (err: any) {
      alert(err.message || 'Error al eliminar banner')
    }
  }

  const handleToggleBanner = async (id: string, currentActive: boolean) => {
    try {
      const nextActive = !currentActive
      const { error } = await supabase.from('banners').update({ is_active: nextActive }).eq('id', id)
      if (error) throw error
      setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: nextActive } : b))
      await revalidateStorefront()
    } catch (err: any) {
      alert(err.message || 'Error al actualizar banner')
    }
  }

  const handleMoveBanner = async (bannerId: string, direction: 'up' | 'down') => {
    const list = banners.filter(b => (
      bannerSection === 'instagram' ? b.position === 'instagram' :
      bannerSection === 'middle' ? b.position === 'middle' :
      (b.position || 'hero') === 'hero'
    ))
    const index = list.findIndex(b => b.id === bannerId)
    if (index === -1) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= list.length) return

    const itemA = list[index]
    const itemB = list[targetIndex]
    
    setBanners(prev => prev.map(b => {
      if (b.id === itemA.id) return { ...b, sort_order: targetIndex + 1 }
      if (b.id === itemB.id) return { ...b, sort_order: index + 1 }
      return b
    }))

    try {
      await Promise.all([
        supabase.from('banners').update({ sort_order: targetIndex + 1 }).eq('id', itemA.id),
        supabase.from('banners').update({ sort_order: index + 1 }).eq('id', itemB.id)
      ])
      await revalidateStorefront()
    } catch (err: any) {
      console.error(err)
      fetchInitialData()
    }
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
          <div className="px-3 py-1.5 rounded-2xl border border-emerald-100 flex items-center gap-2" style={{ backgroundColor: '#d1fae580' }}>
            <RefreshCcw className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">TASA BCV:</span>
            <input 
              type="number" 
              step="0.01"
              className="w-16 text-[10px] font-black text-emerald-900 bg-white border border-emerald-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-emerald-400"
              value={exchangeRate}
              onChange={(e) => updateExchangeRate(e.target.value)}
            />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Bs</span>
          </div>
        </div>
        <div className="bg-slate-100/80 p-1 rounded-2xl flex flex-wrap gap-1">
          {['dashboard', 'inventory', 'upload', 'banners', 'categories', 'organize', 'club'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[60px] py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>
              {tab === 'dashboard' ? 'Ventas' : tab === 'inventory' ? 'Stock' : tab === 'upload' ? 'Cargar' : tab === 'banners' ? 'Banners' : tab === 'categories' ? 'Cats' : tab === 'organize' ? 'Orden' : 'Club'}
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
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-slate-800 text-sm line-clamp-1">{product.title}</h4>
                    {product.badge && (
                      <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        product.badge === 'agotado' || product.badge === 'agotado_rojo'
                          ? 'bg-slate-800 text-white'
                          : product.badge === 'nuevo'
                          ? 'bg-[#00ced1] text-white'
                          : product.badge === 'rebaja'
                          ? 'bg-[#ef4444] text-white'
                          : product.badge === 'rebaja_azul'
                          ? 'bg-[#1e40af] text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {product.badge === 'agotado' || product.badge === 'agotado_rojo' ? 'AGOTADO' : product.badge}
                      </span>
                    )}
                  </div>
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
                      <option value="nuevo">NUEVO (Celeste)</option>
                      <option value="top">TOP (Rojo)</option>
                      <option value="descuentos">DESCUENTOS (Verde)</option>
                      <option value="rebaja">REBAJA (Rojo)</option>
                      <option value="rebaja_azul">REBAJA (Azul)</option>
                      <option value="agotado">AGOTADO (Gris oscuro)</option>
                      <option value="agotado_rojo">AGOTADO (Rojo)</option>
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

        {/* ── TAB BANNERS (CARRUSELES) ── */}
        {activeTab === 'banners' && (() => {
          const currentBanners = banners.filter(b => (
            bannerSection === 'instagram' ? b.position === 'instagram' :
            bannerSection === 'middle' ? b.position === 'middle' :
            (b.position || 'hero') === 'hero'
          ))
          return (
            <div className="space-y-6 animate-fade-in">
              {/* Selector de tipo de carrusel / feed */}
              <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setBannerSection('hero')}
                  className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    bannerSection === 'hero'
                      ? 'bg-[#8dd5e3] text-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <ImageIcon className="size-4" />
                  Carrusel Superior
                </button>
                <button
                  type="button"
                  onClick={() => setBannerSection('middle')}
                  className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    bannerSection === 'middle'
                      ? 'bg-[#8dd5e3] text-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <ImageIcon className="size-4" />
                  Carrusel Intermedio
                </button>
                <button
                  type="button"
                  onClick={() => setBannerSection('instagram')}
                  className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    bannerSection === 'instagram'
                      ? 'bg-[#8dd5e3] text-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <InstagramIcon className="size-4 text-pink-600" />
                  Feed Instagram (Footer)
                </button>
              </div>

              {/* Header info */}
              <div className="bg-white rounded-[32px] shadow-sm p-6 space-y-3 border border-slate-100/80">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8dd5e340' }}>
                    {bannerSection === 'instagram' ? (
                      <InstagramIcon className="size-5 text-pink-600" />
                    ) : (
                      <ImageIcon className="size-5 text-blue-900" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-['Poppins']">
                      {bannerSection === 'hero'
                        ? 'Carrusel Superior (Header Principal)'
                        : bannerSection === 'middle'
                        ? 'Carrusel Intermedio (Entre Productos)'
                        : 'Feed de Instagram (Footer de la Tienda)'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400">
                      {bannerSection === 'hero'
                        ? 'Fotos principales arriba en la portada de la tienda (rotan cada 2 segundos)'
                        : bannerSection === 'middle'
                        ? 'Fotos de la sección intermedia en el catálogo de productos (rotan cada 2 segundos)'
                        : 'Fotos mostradas en la galería del footer al final de la tienda (enlazan a @subibajatiendas)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario para agregar banner / post */}
              <div className="bg-white rounded-[32px] shadow-sm p-6 space-y-4 border border-slate-100/80">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Agregar Foto a {bannerSection === 'hero' ? 'Carrusel Superior' : bannerSection === 'middle' ? 'Carrusel Intermedio' : 'Feed de Instagram'}
                  </p>
                  {newBannerImage && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      Imagen lista
                    </span>
                  )}
                </div>

                {/* Vista previa de la imagen */}
                {newBannerImage ? (
                  <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center group ${bannerSection === 'instagram' ? 'max-w-xs mx-auto aspect-square' : 'aspect-[21/9]'}`}>
                    <img
                      src={newBannerImage}
                      alt="Vista previa banner"
                      className={`w-full h-full ${bannerSection === 'instagram' ? 'object-cover' : 'object-contain'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setNewBannerImage("")}
                      className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors shadow-sm cursor-pointer"
                      title="Quitar imagen"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition-colors px-4 text-center ${bannerSection === 'instagram' ? 'py-8' : 'aspect-[21/9]'}`}>
                    {uploadingBanner ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-7 animate-spin text-blue-500" />
                        <span className="text-xs font-bold text-slate-500">Subiendo imagen a la nube...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-10 rounded-full bg-white shadow-xs flex items-center justify-center text-blue-500">
                          {bannerSection === 'instagram' ? <InstagramIcon className="size-5 text-pink-600" /> : <Camera className="size-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Toca para subir una foto desde tu equipo</p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {bannerSection === 'instagram'
                              ? 'Formato cuadrado o vertical recomendado (1:1 o 4:5)'
                              : 'Formato horizontal recomendado (16:9 o 21:9)'}
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      disabled={uploadingBanner}
                      className="hidden"
                    />
                  </label>
                )}

                {/* URL directa opcional */}
                <div className="space-y-1">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    O pegar URL de imagen
                  </Label>
                  <Input
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={newBannerImage}
                    onChange={(e) => setNewBannerImage(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 border-0 px-4 text-xs font-semibold text-slate-700"
                  />
                </div>

                {/* Título opcional */}
                <div className="space-y-1">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {bannerSection === 'instagram' ? 'Leyenda / Texto de la foto (Opcional)' : 'Título o Nota (Opcional)'}
                  </Label>
                  <Input
                    placeholder={bannerSection === 'instagram' ? 'Ej: ¡Nueva colección infantil disponible en tienda! ✨' : 'Ej: Calzado Infantil, Colección Subibaja...'}
                    value={newBannerTitle}
                    onChange={(e) => setNewBannerTitle(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 border-0 px-4 text-xs font-semibold text-slate-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddBanner}
                  disabled={savingBanner || uploadingBanner || !newBannerImage.trim()}
                  className="w-full h-12 rounded-full font-black tracking-widest text-blue-900 text-xs uppercase shadow-sm active:scale-95 disabled:opacity-40 transition-transform cursor-pointer"
                  style={{ backgroundColor: '#8dd5e3' }}
                >
                  {savingBanner ? 'GUARDANDO...' : `+ AGREGAR A ${bannerSection === 'hero' ? 'CARRUSEL SUPERIOR' : bannerSection === 'middle' ? 'CARRUSEL INTERMEDIO' : 'FEED DE INSTAGRAM'}`}
                </button>
              </div>

              {/* Listado de Banners Actuales */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Fotos ({currentBanners.filter(b => b.is_active).length} activas de {currentBanners.length})
                  </p>
                  <span className="text-[9px] font-bold text-slate-400">
                    {bannerSection === 'instagram' ? 'Mostradas en el footer de último' : 'Rotación: cada 2 seg'}
                  </span>
                </div>

                {currentBanners.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center text-slate-400 text-xs font-bold border border-slate-100">
                    No hay imágenes cargadas en esta sección aún.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentBanners.map((banner, index) => (
                      <div
                        key={banner.id}
                        className={`bg-white rounded-2xl p-4 shadow-sm border transition-all flex items-center gap-3 ${
                          banner.is_active ? 'border-slate-100 hover:border-blue-200' : 'border-slate-100 opacity-60 bg-slate-50/50'
                        }`}
                      >
                        {/* Control de Orden */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(banner.id, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-20 text-slate-600 transition-colors cursor-pointer"
                            title="Subir posición"
                          >
                            <ChevronUp className="size-4" />
                          </button>
                          <span className="text-[10px] font-black text-slate-400 font-mono">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(banner.id, 'down')}
                            disabled={index === currentBanners.length - 1}
                            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-20 text-slate-600 transition-colors cursor-pointer"
                            title="Bajar posición"
                          >
                            <ChevronDown className="size-4" />
                          </button>
                        </div>

                        {/* Miniatura */}
                        <div className={`${bannerSection === 'instagram' ? 'w-16 h-16' : 'w-24 h-16'} rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center`}>
                          <img
                            src={banner.image_url}
                            alt={banner.title || 'Banner'}
                            className={`w-full h-full ${bannerSection === 'instagram' ? 'object-cover' : 'object-contain'}`}
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-slate-800 truncate">
                              {banner.title || `Foto #${index + 1}`}
                            </p>
                            <span
                              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                banner.is_active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {banner.is_active ? 'Activa' : 'Pausada'}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 truncate mt-0.5 font-mono">
                            {banner.image_url}
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleBanner(banner.id, banner.is_active)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              banner.is_active
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {banner.is_active ? 'Pausar' : 'Activar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar banner"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* ── TAB CATEGORIAS ── */}
        {activeTab === 'categories' && (
          <CategoryManager categories={categories} setCategories={setCategories} supabase={supabase} />
        )}

        {activeTab === 'organize' && (
          <SortableProductList products={products} setProducts={setProducts} supabase={supabase} categories={categories} />
        )}

        {activeTab === 'club' && (
          <div className="space-y-6 animate-fade-in">

            {/* Listado y Gestión de Tarjetas de Regalo */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="size-5 text-rose-500" />
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Tarjetas de Regalo ({giftCards.length})
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Edita el diseño, precio, código y foto con el lápiz cuando quieras
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewGiftCardForm(!showNewGiftCardForm)}
                  className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#8dd5e3] hover:bg-[#7bc8d6] text-blue-950 transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3" />
                  {showNewGiftCardForm ? 'Cerrar Formulario' : 'Nueva Tarjeta'}
                </button>
              </div>

              {/* Formulario para generar nueva tarjeta de regalo (colapsable) */}
              {showNewGiftCardForm && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-rose-100/60 space-y-4 animate-in fade-in zoom-in-95">
                  <p className="text-[10px] font-black uppercase text-blue-900 tracking-wider">
                    Registrar Nueva Tarjeta de Regalo
                  </p>
                  <div className="space-y-3">
                    {/* Foto o Diseño de la Gift Card */}
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-white flex flex-col items-center justify-center aspect-[1.8/1] max-w-sm mx-auto overflow-hidden group">
                      {giftCardForm.image_url ? (
                        <img 
                          src={giftCardForm.image_url} 
                          className={`absolute inset-0 w-full h-full ${giftCardForm.image_url.includes('logo') ? 'object-contain p-4' : 'object-cover'}`} 
                        />
                      ) : (
                        <>
                          <div className="bg-rose-50 p-3 rounded-2xl shadow-xs mb-1"><Camera className="text-rose-500 size-5" /></div>
                          <span className="text-slate-500 font-bold text-xs">Subir Diseño o Foto de Gift Card</span>
                          <span className="text-slate-400 text-[9px] font-medium mt-0.5">(Opcional: Si no subes foto se usará el diseño oficial)</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleGiftCardImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingGiftImg} />
                      {uploadingGiftImg && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 size-6" /></div>}
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                        <Input
                          placeholder="Nombre / Título (Ej: Gift Card $50 USD)"
                          value={giftCardForm.title}
                          onChange={(e) => setGiftCardForm({ ...giftCardForm, title: e.target.value })}
                          className="h-11 rounded-xl bg-white border border-slate-200 pl-11 text-xs font-semibold text-slate-700"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                          <Input
                            placeholder="Monto / Precio USD (Ej: 50)"
                            type="number"
                            value={giftCardForm.balance}
                            onChange={(e) => setGiftCardForm({ ...giftCardForm, balance: e.target.value })}
                            className="h-11 rounded-xl bg-white border border-slate-200 pl-11 text-xs font-black text-slate-700"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                            <Input
                              placeholder="Código (Ej: SB-GIFT-50)"
                              value={giftCardForm.code}
                              onChange={(e) => setGiftCardForm({ ...giftCardForm, code: e.target.value.toUpperCase() })}
                              className="h-11 rounded-xl bg-white border border-slate-200 pl-11 font-mono font-bold text-xs uppercase text-slate-700"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={generateRandomGiftCode}
                            className="px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-[10px] font-black tracking-wider uppercase text-slate-600 active:scale-95 transition-transform cursor-pointer"
                          >
                            🎲 Auto
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <Info className="absolute left-4 top-3.5 size-4 text-slate-350 pointer-events-none" />
                        <textarea
                          placeholder="Descripción (Ej: El obsequio ideal para sorprender en boutique. Válido para ropa y calzado.)"
                          value={giftCardForm.description}
                          onChange={(e) => setGiftCardForm({ ...giftCardForm, description: e.target.value })}
                          className="w-full min-h-[60px] rounded-xl bg-white border border-slate-200 pl-11 pt-3 text-xs font-medium outline-none resize-none placeholder:text-slate-400 text-slate-750"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                          <Input
                            placeholder="Nombre del Cliente (Opcional)"
                            value={giftCardForm.ownerName}
                            onChange={(e) => setGiftCardForm({ ...giftCardForm, ownerName: e.target.value })}
                            className="h-11 rounded-xl bg-white border border-slate-200 pl-11 text-xs font-semibold text-slate-700"
                          />
                        </div>
                        <div className="relative">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                          <Input
                            placeholder="Teléfono del Cliente (Opcional)"
                            value={giftCardForm.ownerPhone}
                            onChange={(e) => setGiftCardForm({ ...giftCardForm, ownerPhone: e.target.value })}
                            className="h-11 rounded-xl bg-white border border-slate-200 pl-11 text-xs font-semibold text-slate-700"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleCreateGiftCard}
                        disabled={savingGift || uploadingGiftImg || !giftCardForm.balance}
                        className="w-full h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm active:scale-95 disabled:opacity-50 transition-transform cursor-pointer"
                        style={{ backgroundColor: '#8dd5e3' }}
                      >
                        {savingGift ? 'GUARDANDO...' : 'CREAR TARJETA DE REGALO'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Tarjetas de Regalo */}
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="size-6 animate-spin text-slate-300" /></div>
              ) : giftCards.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl">
                  No hay tarjetas de regalo creadas aún
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {giftCards.map((gc) => {
                    const isLogo = gc.image_url?.includes('logo')
                    return (
                      <div
                        key={gc.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          gc.is_active ? 'bg-white border-slate-100 hover:border-blue-100 shadow-xs' : 'bg-slate-50/70 border-slate-200 opacity-65'
                        }`}
                      >
                        {/* Thumbnail y Cambio Rápido de Foto */}
                        <div className="flex items-center gap-3.5 w-full sm:w-auto flex-1 min-w-0">
                          <div className="relative group w-20 h-14 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-200 bg-gradient-to-r from-blue-900 to-indigo-950 overflow-hidden shadow-xs">
                            <img
                              src={gc.image_url || '/imagem_gift_card.jpeg'}
                              alt={gc.title || gc.code}
                              className={`w-full h-full ${isLogo ? 'object-contain p-1.5' : 'object-cover'}`}
                            />
                            {uploadingGiftCardId === gc.id ? (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                                <Loader2 className="size-5 animate-spin text-blue-500" />
                              </div>
                            ) : (
                              <label
                                className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[8px] font-black uppercase text-center p-1"
                                title="Cambiar foto o diseño de esta tarjeta"
                              >
                                <Camera className="size-4 mb-0.5" />
                                <span>Cambiar</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpdateGiftCardImage(gc.id, file)
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-xs text-slate-800 truncate">
                                {gc.title || `Gift Card $${Number(gc.balance).toFixed(0)} USD`}
                              </h4>
                              <span className="text-[9px] font-black text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex-shrink-0 font-['Poppins']">
                                ${Number(gc.balance).toFixed(2)} USD
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                {gc.code}
                              </span>
                              {!gc.is_active && (
                                <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                                  Pausada
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                              {gc.description || 'Tarjeta de regalo Subibaja'}
                            </p>
                            {gc.owner_name && (
                              <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                                Asignada a: {gc.owner_name} {gc.owner_phone ? `(${gc.owner_phone})` : ''}
                              </p>
                            )}
                            
                            {/* Botones de acción directa sobre la foto */}
                            <div className="flex items-center gap-2 mt-2">
                              <label className="text-[9px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all">
                                <Camera className="size-3" />
                                <span>Cambiar Foto / Diseño</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpdateGiftCardImage(gc.id, file)
                                  }}
                                />
                              </label>
                              {!isLogo && (
                                <button
                                  onClick={() => handleResetGiftCardToLogo(gc.id)}
                                  className="text-[9px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/70 px-2 py-1 rounded-lg cursor-pointer transition-all"
                                  title="Restablecer al logo oficial"
                                >
                                  Usar Logo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botones de edición y estado */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => setEditingGiftCard({ ...gc })}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="Editar detalles de la tarjeta"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleToggleGiftCardActive(gc)}
                            className={`px-2 py-1 rounded-xl transition-colors cursor-pointer text-[9px] font-black uppercase ${
                              gc.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title={gc.is_active ? 'Pausar tarjeta' : 'Activar tarjeta'}
                          >
                            {gc.is_active ? 'Activa' : 'Pausada'}
                          </button>
                          <button
                            onClick={() => handleDeleteGiftCard(gc.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Eliminar tarjeta"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
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

            {/* Listado y Gestión de Premios del Catálogo */}
            <div className="bg-white rounded-[32px] shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="size-5 text-blue-500" />
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Premios del Catálogo ({rewards.length})
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Cambia la foto por producto o logo cuando quieras
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewRewardForm(!showNewRewardForm)}
                  className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#8dd5e3] hover:bg-[#7bc8d6] text-blue-950 transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3" />
                  {showNewRewardForm ? 'Cerrar Formulario' : 'Nuevo Premio'}
                </button>
              </div>

              {/* Formulario para publicar nuevo premio (colapsable) */}
              {showNewRewardForm && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-blue-100/60 space-y-4 animate-in fade-in zoom-in-95">
                  <p className="text-[10px] font-black uppercase text-blue-900 tracking-wider">
                    Registrar Nuevo Premio
                  </p>
                  <div className="space-y-3">
                    {/* Reward Image Upload */}
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-white flex flex-col items-center justify-center aspect-video overflow-hidden group">
                      {rewardForm.image_url ? (
                        <img 
                          src={rewardForm.image_url} 
                          className={`absolute inset-0 w-full h-full ${rewardForm.image_url.includes('logo') ? 'object-contain p-4' : 'object-cover'}`} 
                        />
                      ) : (
                        <>
                          <div className="bg-blue-50 p-3 rounded-2xl shadow-xs mb-1"><Camera className="text-blue-500 size-5" /></div>
                          <span className="text-slate-500 font-bold text-xs">Subir Foto del Premio</span>
                          <span className="text-slate-400 text-[9px] font-medium mt-0.5">(Opcional: Si no subes foto se usará el Logo de la tienda)</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleRewardImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingRewardImg} />
                      {uploadingRewardImg && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 size-6" /></div>}
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                        <Input
                          placeholder="Título del Premio (Ej: Lazo Boutique de Regalo)"
                          value={rewardForm.title}
                          onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                          className="h-11 rounded-xl bg-white border border-slate-200 pl-11 text-xs font-semibold text-slate-700"
                        />
                      </div>
                      <div className="relative">
                        <Info className="absolute left-4 top-3.5 size-4 text-slate-350 pointer-events-none" />
                        <textarea
                          placeholder="Descripción del premio (Ej: Válido para cualquier modelo en tienda)"
                          value={rewardForm.description}
                          onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                          className="w-full min-h-[70px] rounded-xl bg-white border border-slate-200 pl-11 pt-3 text-xs font-medium outline-none resize-none placeholder:text-slate-400 text-slate-750"
                        />
                      </div>
                      <div className="relative">
                        <Star className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-350 pointer-events-none" />
                        <Input
                          placeholder="Puntos requeridos (Ej: 50)"
                          type="number"
                          value={rewardForm.pointsRequired}
                          onChange={(e) => setRewardForm({ ...rewardForm, pointsRequired: e.target.value })}
                          className="h-11 rounded-xl bg-white border border-slate-200 pl-11 text-xs font-black text-slate-700"
                        />
                      </div>
                      <button
                        onClick={handleSaveReward}
                        disabled={savingReward || uploadingRewardImg || !rewardForm.title || !rewardForm.pointsRequired}
                        className="w-full h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm active:scale-95 disabled:opacity-50 transition-transform cursor-pointer"
                        style={{ backgroundColor: '#8dd5e3' }}
                      >
                        {savingReward ? 'GUARDANDO...' : 'PUBLICAR EN EL CATÁLOGO'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Premios Actuales */}
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="size-6 animate-spin text-slate-300" /></div>
              ) : rewards.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl">
                  No hay premios en el catálogo aún
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {rewards.map((rew) => {
                    const isLogo = !rew.image_url || rew.image_url.includes('logo')
                    return (
                      <div
                        key={rew.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          rew.is_active ? 'bg-white border-slate-100 hover:border-blue-100 shadow-xs' : 'bg-slate-50/70 border-slate-200 opacity-65'
                        }`}
                      >
                        {/* Thumbnail y Cambio Rápido de Foto */}
                        <div className="flex items-center gap-3.5 w-full sm:w-auto flex-1 min-w-0">
                          <div className="relative group w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-100 bg-gradient-to-br from-[#8dd5e3]/20 via-white to-pink-50/30 overflow-hidden shadow-xs">
                            <img
                              src={rew.image_url || '/logo-principal.jpg'}
                              alt={rew.title}
                              className={`w-full h-full ${isLogo ? 'object-contain p-1.5' : 'object-cover'}`}
                            />
                            {uploadingRewardId === rew.id ? (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                                <Loader2 className="size-5 animate-spin text-blue-500" />
                              </div>
                            ) : (
                              <label
                                className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[8px] font-black uppercase text-center p-1"
                                title="Cambiar foto de este premio"
                              >
                                <Camera className="size-4 mb-0.5" />
                                <span>Cambiar</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpdateRewardImage(rew.id, file)
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-xs text-slate-800 truncate">{rew.title}</h4>
                              <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                {rew.points_required} pts
                              </span>
                              {!rew.is_active && (
                                <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                                  Pausado
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">{rew.description || 'Sin descripción'}</p>
                            
                            {/* Botones de acción directa sobre la foto */}
                            <div className="flex items-center gap-2 mt-2">
                              <label className="text-[9px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/70 px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all">
                                <Camera className="size-3" />
                                <span>{isLogo ? 'Colocar Foto de Producto' : 'Cambiar Foto'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpdateRewardImage(rew.id, file)
                                  }}
                                />
                              </label>
                              {!isLogo && (
                                <button
                                  onClick={() => handleResetRewardToLogo(rew.id)}
                                  className="text-[9px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/70 px-2 py-1 rounded-lg cursor-pointer transition-all"
                                  title="Restablecer al logo oficial"
                                >
                                  Usar Logo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botones de edición y estado */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => setEditingReward({ ...rew })}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="Editar título y puntos"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleToggleRewardActive(rew)}
                            className={`px-2 py-1 rounded-xl transition-colors cursor-pointer text-[9px] font-black uppercase ${
                              rew.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title={rew.is_active ? 'Pausar premio' : 'Activar premio'}
                          >
                            {rew.is_active ? 'Activo' : 'Pausado'}
                          </button>
                          <button
                            onClick={() => handleDeleteReward(rew.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Eliminar premio"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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
          <div className="relative w-full max-w-[390px] bg-white rounded-[32px] overflow-hidden shadow-2xl p-6 border border-slate-100 flex flex-col gap-3.5 text-center z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-10 max-h-[92vh] overflow-y-auto">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 relative shadow-sm border border-blue-100/30">
              <Crown className="size-5 fill-blue-100 text-blue-900" />
              <Sparkles className="size-3.5 text-amber-400 fill-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-black tracking-widest text-[#8dd5e3] bg-blue-900 px-3 py-0.5 rounded-full uppercase inline-block">Código QR y Link de Puntos</span>
              <h3 className="text-sm font-black text-blue-900 font-['Poppins'] tracking-tight mt-1 uppercase">
                ¡Escanea o toca el link!
              </h3>
              <p className="text-[11px] text-slate-500 font-bold">
                Compra de ${generatedVoucher.amount_usd.toFixed(2)} USD = <span className="text-blue-900 font-black">{generatedVoucher.points} Puntos</span>
              </p>
            </div>

            {(() => {
              const claimUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/puntos?claim=${generatedVoucher.id}`
              return (
                <div className="space-y-3">
                  {/* QR Image Container Clickable */}
                  <a 
                    href={claimUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Toca para abrir enlace directamente"
                    className="mx-auto bg-slate-50 p-3 rounded-2xl border border-slate-100/80 shadow-inner flex flex-col items-center justify-center w-48 h-48 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(claimUrl)}`}
                      alt="QR Points Voucher"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </a>

                  {/* Card con Link Directo para Celular / Compras Online */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                        Link para compras online
                      </span>
                      <a
                        href={claimUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase"
                      >
                        Abrir <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                    
                    <a
                      href={claimUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[10px] font-bold text-blue-600 hover:underline break-all bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs font-mono"
                    >
                      {claimUrl}
                    </a>

                    <div className="flex gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(claimUrl)
                          alert("¡Enlace de puntos copiado al portapapeles!")
                        }}
                        className="flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Copy className="size-3 text-slate-500" />
                        Copiar Link
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const msg = `¡Hola! Gracias por tu compra en Subibaja. Acumulaste ${generatedVoucher.points} puntos ($${generatedVoucher.amount_usd.toFixed(2)} USD). Haz clic en este enlace desde tu celular para sumarlos a tu cuenta o registrarte en el Club VIP:\n\n${claimUrl}`
                          let targetUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`
                          if (generatedVoucher.phone) {
                            let cleanPhone = generatedVoucher.phone.replace(/[^0-9]/g, '')
                            if (cleanPhone.startsWith('0')) cleanPhone = '58' + cleanPhone.substring(1)
                            targetUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
                          }
                          window.open(targetUrl, '_blank')
                        }}
                        className="flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="size-3 text-white" />
                        WhatsApp
                      </button>
                    </div>
                  </div>

                  <p className="text-[8.5px] text-slate-400 leading-normal font-semibold px-2">
                    El cliente puede escanear el QR o hacer clic directamente en el link desde su celular para registrarse o acumular sus puntos.
                  </p>
                </div>
              )
            })()}

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

      {/* Modal para Editar Premio */}
      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setEditingReward(null)}
          />
          <div className="relative w-full max-w-[420px] bg-white rounded-[32px] overflow-hidden shadow-2xl p-6 border border-slate-100 flex flex-col gap-4 z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-10 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="size-5 text-blue-500" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Editar Premio del Catálogo
                </h3>
              </div>
              <button 
                onClick={() => setEditingReward(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Foto del premio y cambio interactivo */}
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="relative group w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden bg-gradient-to-br from-[#8dd5e3]/20 via-white to-pink-50/30 flex items-center justify-center shadow-xs">
                <img
                  src={editingReward.image_url || '/logo-principal.jpg'}
                  alt={editingReward.title}
                  className={`w-full h-full ${editingReward.image_url?.includes('logo') ? 'object-contain p-2' : 'object-cover'}`}
                />
                {uploadingRewardId === editingReward.id ? (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <label 
                    className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[8px] font-black uppercase text-center p-1"
                    title="Subir nueva foto"
                  >
                    <Camera className="size-4 mb-0.5" />
                    <span>Cambiar</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          setUploadingRewardId(editingReward.id)
                          const fileName = `rewards_${Date.now()}.${file.name.split('.').pop()}`
                          const { error: uploadErr } = await supabase.storage.from('product-images').upload(`products/${fileName}`, file)
                          if (uploadErr) throw uploadErr
                          const { data } = supabase.storage.from('product-images').getPublicUrl(`products/${fileName}`)
                          setEditingReward((prev: any) => ({ ...prev, image_url: data.publicUrl }))
                        } catch (err: any) {
                          alert(err.message || 'Error al subir foto')
                        } finally {
                          setUploadingRewardId(null)
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[9px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all">
                  <Camera className="size-3" />
                  <span>Subir Foto de Producto</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setUploadingRewardId(editingReward.id)
                        const fileName = `rewards_${Date.now()}.${file.name.split('.').pop()}`
                        const { error: uploadErr } = await supabase.storage.from('product-images').upload(`products/${fileName}`, file)
                        if (uploadErr) throw uploadErr
                        const { data } = supabase.storage.from('product-images').getPublicUrl(`products/${fileName}`)
                        setEditingReward((prev: any) => ({ ...prev, image_url: data.publicUrl }))
                      } catch (err: any) {
                        alert(err.message || 'Error al subir foto')
                      } finally {
                        setUploadingRewardId(null)
                      }
                    }}
                  />
                </label>
                {editingReward.image_url && !editingReward.image_url.includes('logo') && (
                  <button
                    onClick={() => setEditingReward((prev: any) => ({ ...prev, image_url: '/logo-principal.jpg' }))}
                    className="text-[9px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                  >
                    Usar Logo
                  </button>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Título</Label>
                <Input
                  value={editingReward.title}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 border-0 text-xs font-bold text-slate-700 mt-1"
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Descripción</Label>
                <textarea
                  value={editingReward.description || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  className="w-full min-h-[70px] rounded-xl bg-slate-50 border-0 p-3 text-xs font-medium outline-none resize-none placeholder:text-slate-400 text-slate-750 mt-1"
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Puntos Requeridos</Label>
                <Input
                  type="number"
                  value={editingReward.points_required}
                  onChange={(e) => setEditingReward({ ...editingReward, points_required: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 border-0 text-xs font-black text-slate-700 mt-1"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-700">Estado en Tienda</p>
                  <p className="text-[9px] text-slate-400 font-medium">Visible en el catálogo de clientes</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingReward({ ...editingReward, is_active: !editingReward.is_active })}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                    editingReward.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {editingReward.is_active ? 'Activo' : 'Pausado'}
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingReward(null)}
                className="flex-1 h-11 rounded-full font-black text-slate-500 hover:bg-slate-100 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRewardEdit}
                className="flex-1 h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm active:scale-95 transition-transform cursor-pointer"
                style={{ backgroundColor: '#8dd5e3' }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Tarjeta de Regalo */}
      {editingGiftCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setEditingGiftCard(null)}
          />
          <div className="relative w-full max-w-[420px] bg-white rounded-[32px] overflow-hidden shadow-2xl p-6 border border-slate-100 flex flex-col gap-4 z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-10 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="size-5 text-rose-500" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Editar Tarjeta de Regalo
                </h3>
              </div>
              <button 
                onClick={() => setEditingGiftCard(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Foto o Diseño del Gift Card */}
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="relative group w-32 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-950 flex items-center justify-center shadow-xs">
                <img
                  src={editingGiftCard.image_url || '/imagem_gift_card.jpeg'}
                  alt={editingGiftCard.title || editingGiftCard.code}
                  className={`w-full h-full ${editingGiftCard.image_url?.includes('logo') ? 'object-contain p-2' : 'object-cover'}`}
                />
                {uploadingGiftCardId === editingGiftCard.id ? (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <label 
                    className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[8px] font-black uppercase text-center p-1"
                    title="Subir nueva foto o diseño"
                  >
                    <Camera className="size-4 mb-0.5" />
                    <span>Cambiar</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          setUploadingGiftCardId(editingGiftCard.id)
                          const fileName = `giftcard_${Date.now()}.${file.name.split('.').pop()}`
                          const { error: uploadErr } = await supabase.storage.from('product-images').upload(`products/${fileName}`, file)
                          if (uploadErr) throw uploadErr
                          const { data } = supabase.storage.from('product-images').getPublicUrl(`products/${fileName}`)
                          setEditingGiftCard((prev: any) => ({ ...prev, image_url: data.publicUrl }))
                        } catch (err: any) {
                          alert(err.message || 'Error al subir foto')
                        } finally {
                          setUploadingGiftCardId(null)
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[9px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all">
                  <Camera className="size-3" />
                  <span>Subir Foto / Diseño</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setUploadingGiftCardId(editingGiftCard.id)
                        const fileName = `giftcard_${Date.now()}.${file.name.split('.').pop()}`
                        const { error: uploadErr } = await supabase.storage.from('product-images').upload(`products/${fileName}`, file)
                        if (uploadErr) throw uploadErr
                        const { data } = supabase.storage.from('product-images').getPublicUrl(`products/${fileName}`)
                        setEditingGiftCard((prev: any) => ({ ...prev, image_url: data.publicUrl }))
                      } catch (err: any) {
                        alert(err.message || 'Error al subir foto')
                      } finally {
                        setUploadingGiftCardId(null)
                      }
                    }}
                  />
                </label>
                {editingGiftCard.image_url && !editingGiftCard.image_url.includes('logo') && (
                  <button
                    onClick={() => setEditingGiftCard((prev: any) => ({ ...prev, image_url: '/logo-principal.jpg' }))}
                    className="text-[9px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                  >
                    Usar Logo
                  </button>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre / Título</Label>
                <Input
                  value={editingGiftCard.title || ''}
                  onChange={(e) => setEditingGiftCard({ ...editingGiftCard, title: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 border-0 text-xs font-bold text-slate-700 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Precio / Saldo ($ USD)</Label>
                  <Input
                    type="number"
                    value={editingGiftCard.balance}
                    onChange={(e) => setEditingGiftCard({ ...editingGiftCard, balance: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 border-0 text-xs font-black text-slate-700 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Código de Activación</Label>
                  <Input
                    value={editingGiftCard.code || ''}
                    onChange={(e) => setEditingGiftCard({ ...editingGiftCard, code: e.target.value.toUpperCase() })}
                    className="h-11 rounded-xl bg-slate-50 border-0 text-xs font-mono font-bold text-slate-700 uppercase mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Descripción</Label>
                <textarea
                  value={editingGiftCard.description || ''}
                  onChange={(e) => setEditingGiftCard({ ...editingGiftCard, description: e.target.value })}
                  className="w-full min-h-[60px] rounded-xl bg-slate-50 border-0 p-3 text-xs font-medium outline-none resize-none placeholder:text-slate-400 text-slate-750 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dueño (Opcional)</Label>
                  <Input
                    value={editingGiftCard.owner_name || ''}
                    onChange={(e) => setEditingGiftCard({ ...editingGiftCard, owner_name: e.target.value })}
                    placeholder="Sin asignar"
                    className="h-11 rounded-xl bg-slate-50 border-0 text-xs font-semibold text-slate-700 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Teléfono (Opcional)</Label>
                  <Input
                    value={editingGiftCard.owner_phone || ''}
                    onChange={(e) => setEditingGiftCard({ ...editingGiftCard, owner_phone: e.target.value })}
                    placeholder="Sin teléfono"
                    className="h-11 rounded-xl bg-slate-50 border-0 text-xs font-semibold text-slate-700 mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-700">Estado de la Tarjeta</p>
                  <p className="text-[9px] text-slate-400 font-medium">Activa para compra y canje</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingGiftCard({ ...editingGiftCard, is_active: !editingGiftCard.is_active })}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                    editingGiftCard.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {editingGiftCard.is_active ? 'Activa' : 'Pausada'}
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingGiftCard(null)}
                className="flex-1 h-11 rounded-full font-black text-slate-500 hover:bg-slate-100 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveGiftCardEdit}
                className="flex-1 h-11 rounded-full font-black tracking-widest text-[#1e3a5f] text-[10px] uppercase shadow-sm active:scale-95 transition-transform cursor-pointer"
                style={{ backgroundColor: '#8dd5e3' }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
