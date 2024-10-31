'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MoonIcon, SunIcon, HelpCircle, Loader2, Edit, ScrollText, Menu, Trash, Maximize2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import Head from 'next/head'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [title, setTitle] = useState('')
  const [reason, setReason] = useState('')
  const [contentType, setContentType] = useState('TikTok')
  const [script, setScript] = useState('')
  const [history, setHistory] = useState<{ title: string; script: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showScript, setShowScript] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [shake, setShake] = useState(false)
  const [rememberPassword, setRememberPassword] = useState(false)
  const [editingTitle, setEditingTitle] = useState<number | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  useEffect(() => {
    const storedHistory = localStorage.getItem('scriptHistory')
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory))
    }

    const authData = JSON.parse(localStorage.getItem('authData') || '{}')
    if (authData?.isAuthenticated && new Date(authData.expiresAt) > new Date()) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [shake])

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showError])

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showAlert])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowScript(null)

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, reason, contentType }),
      })

      if (response.ok) {
        const data = await response.json()
        setScript(data.script)
        const newHistory = [...history, { title, script: data.script }]
        setHistory(newHistory)
        localStorage.setItem('scriptHistory', JSON.stringify(newHistory))
        setShowScript(newHistory.length - 1)
      } else {
        console.error('Gagal buat script bro!')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)

    if (password === 'dev' || password === '') {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsAuthenticated(true)
      setShowError(false)

      if (rememberPassword) {
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 1)
        localStorage.setItem('authData', JSON.stringify({ isAuthenticated: true, expiresAt }))
      }
    } else {
      setShowError(true)
      setShake(true)
      setPassword('')
    }

    setIsAuthenticating(false)
  }

  const handleTitleEdit = (index: number) => {
    setEditingTitle(index)
    setEditedTitle(history[index].title)
  }

  const saveTitleEdit = (index: number) => {
    const updatedHistory = [...history]
    updatedHistory[index] = { ...updatedHistory[index], title: editedTitle }
    setHistory(updatedHistory)
    localStorage.setItem('scriptHistory', JSON.stringify(updatedHistory))
    setEditingTitle(null)
  }

  const deleteScript = (index: number) => {
    const updatedHistory = history.filter((_, i) => i !== index)
    setHistory(updatedHistory)
    localStorage.setItem('scriptHistory', JSON.stringify(updatedHistory))
    if (showScript === index) {
      setShowScript(null)
    }
    setAlertMessage('Skrip berhasil dihapus')
    setShowAlert(true)
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Card className={`w-full max-w-md transition-transform ${shake ? 'animate-shake' : ''}`}>
          <CardHeader>
            <CardTitle className="text-center">Masukin Password Dulu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukin password"
                  className={`transition-all ${showError ? 'border-red-500' : ''}`}
                  disabled={isAuthenticating}
                />
                {showError && (
                  <Alert variant="destructive">
                    <AlertDescription>Password salah, coba lagi ya!</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={rememberPassword} 
                  onChange={() => setRememberPassword(!rememberPassword)} 
                  className="mr-2"
                />
                <Label>Jangan tanya sampai 1 Jam</Label>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" onClick={handleAuth} className="w-full" disabled={isAuthenticating}>
              {isAuthenticating ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Lagi otentikasi bro...
                </div>
              ) : 'Login'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScrollText className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Sekriptor</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Riwayat Script</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-accent rounded-lg cursor-pointer"
                      onClick={() => {
                        setShowScript(index)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        {editingTitle === index ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              onBlur={() => saveTitleEdit(index)}
                              onKeyPress={(e) => e.key === 'Enter' && saveTitleEdit(index)}
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full group">
                            <span className="text-sm font-medium truncate max-w-[200px] relative">
                              {item.title}
                              <span className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent"></span>
                            </span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTitleEdit(index);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScript(index);
                                }}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Buat Sekrip</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contentType">Tipe Konten</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger id="contentType">
                      <SelectValue placeholder="Pilih tipe konten" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                      <SelectItem value="Full Konten">Full Konten</SelectItem>
                      <SelectItem value="Instagram Reels">Instagram Reels</SelectItem>
                      <SelectItem value="YouTube Shorts">YouTube Shorts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Konten</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukin judul konten lo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Kenapa buat konten ini?</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Kenapa lo mau buat konten ini?"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Lagi loading...
                    </div>
                  ) : 'Buat Script'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className={`md:sticky md:top-4 transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {showScript !== null ? history[showScript]?.title : script ? 'Script Baru' : 'Preview Script'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={toggleMaximize}>
                  <Maximize2 className="h-4  w-4" />
                </Button>
              </CardHeader>
              <CardContent className={isMaximized ? 'h-[calc(100vh-4rem)] overflow-auto' : ''}>
                <div className={`whitespace-pre-wrap ${isMaximized ? '' : 'max-h-[50vh] overflow-y-auto scrollbar-hide'}`}>
                  {showScript !== null ? history[showScript]?.script : script || 'Belum ada script yang dibuat'}
                </div>
              </CardContent>
            </Card>

            <Card className="md:sticky md:top-4 hidden md:block">
              <CardHeader>
                <CardTitle>Histori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-accent rounded-lg cursor-pointer"
                      onClick={() => setShowScript(index)}
                    >
                      <div className="flex items-center justify-between">
                        {editingTitle === index ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              onBlur={() => saveTitleEdit(index)}
                              onKeyPress={(e) => e.key === 'Enter' && saveTitleEdit(index)}
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full group">
                            <span className="text-sm font-medium truncate max-w-[200px] relative">
                              {item.title}
                              <span className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent"></span>
                            </span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTitleEdit(index);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScript(index);
                                }}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="fixed bottom-4 right-4">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gimana Cara Pake Sekriptor?</DialogTitle>
            <DialogDescription>
              1. Pilih tipe konten dari dropdown.<br />
              2. Masukin judul buat konten lo.<br />
              3. Tulis alasan atau konteks buat konten itu.<br />
              4. Klik &quot;Generate Script&quot; buat bikin skripnya.<br />
              5. Cek hasil skrip lo di bagian preview.<br />
              6. Riwayat script ada di sidebar kanan atau menu di mobile.<br />
              7. Lo bisa hapus skrip yang ga lo mau dari riwayat.<br />
              8. Klik tombol maximize buat liat skrip lebih gede.<br /><br />
              Update terbaru: 
              - Judul panjang sekarang ada efek fade
              - Scroll indikator dihilangkan tapi masih bisa di-scroll
              - Footer ditambahkan<br /><br />
              Dibikin sama Yoel, enjoy!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {showAlert && (
        <Alert className="fixed bottom-4 left-4 w-auto">
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <footer className="border-t mt-8 py-4 text-center text-sm text-muted-foreground">
        Sekriptor, Yoel 2024
      </footer>
    </div>
  )
}
