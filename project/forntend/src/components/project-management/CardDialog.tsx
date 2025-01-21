"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { cardService, Card } from "@/services/cardService"
import { X, Clock, Tag, Users } from 'lucide-react'
import TimeTracker from './TimeTracker'
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { colors } from "../cardcolor"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CardDialogProps {
  cardId: string
  isOpen: boolean
  onClose: () => void
}


const BOARD_USERS = [
  { id: '1', name: 'nafees' },
  { id: '2', name: 'sagor' },
  { id: '3', name: 'muqtu' },
]

export default function CardDialog({ cardId, isOpen, onClose }: CardDialogProps) {
  const [card, setCard] = useState<Card | null>(null)
  const [newLabel, setNewLabel] = useState("")
  const [newLink, setNewLink] = useState("")
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (cardId && isOpen) {
      loadCardData()
    }
  }, [cardId, isOpen])

  const loadCardData = async () => {
    try {
      const cardData = await cardService.getCardById(cardId)
      setCard(cardData)
    } catch (error) {
      console.error("Error loading card data:", error)
    }
  }

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabel.trim() || !card) return

    try {
      const updatedLabels = [...(card.labels || []), newLabel]
      const updatedCard = await cardService.updateCardLabels(card.id, updatedLabels)
      setCard(updatedCard)
      setNewLabel("")
    } catch (error) {
      console.error("Error adding label:", error)
    }
  }

  const handleRemoveLabel = async (label: string) => {
    if (!card) return

    try {
      const updatedLabels = card.labels?.filter((l) => l !== label) || []
      const updatedCard = await cardService.updateCardLabels(card.id, updatedLabels)
      setCard(updatedCard)
    } catch (error) {
      console.error("Error removing label:", error)
    }
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLink.trim() || !card) return

    try {
      const updatedLinks = [...(card.links || []), newLink]
      const updatedCard = await cardService.updateLinks(card.id, updatedLinks)
      setCard(updatedCard)
      setNewLink("")
    } catch (error) {
      console.error("Error adding link:", error)
    }
  }

  const handleRemoveLink = async (link: string) => {
    if (!card) return

    try {
      const updatedLinks = card.links?.filter((l) => l !== link) || []
      const updatedCard = await cardService.updateLinks(card.id, updatedLinks)
      setCard(updatedCard)
    } catch (error) {
      console.error("Error removing link:", error)
    }
  }

  const handleToggleCompletion = async () => {
    if (!card) return

    try {
      const updatedCard = await cardService.updateCardIsCompleted(card.id, !card.isCompleted)
      setCard(updatedCard)
    } catch (error) {
      console.error("Error toggling completion status:", error)
    }
  }

  const handleAssignUser = (userId: string) => {
    if (!card) return
    
    if (!assignedUsers.includes(userId)) {
      setAssignedUsers(prev => [...prev, userId])
    }
  }

  const handleRemoveUser = (userId: string) => {
    if (!card) return
    setAssignedUsers(prev => prev.filter(id => id !== userId))
  }

  if (!isOpen || !card) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Dialog.Panel 
            className="w-full max-w-2xl rounded-lg shadow-xl"
            style={{
              backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
              boxShadow: isDark ? colors.shadow.dark : colors.shadow.light,
            }}
          >
            <div className="flex justify-between items-start p-4 border-b" style={{ borderColor: isDark ? colors.border.dark : colors.border.light }}>
              <Dialog.Title 
                className="text-lg font-semibold"
                style={{ color: isDark ? colors.text.dark.primary : colors.text.light.primary }}
              >
                {card.title}
              </Dialog.Title>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}>Description</h3>
                <p className="text-sm" style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}>{card.description || "No description provided."}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}>Labels</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {card.labels && card.labels.map((label, index) => (
                    <Badge 
                      key={index}
                      className="px-2 py-0.5 text-xs font-medium flex items-center"
                      style={{
                        background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                        color: 'white',
                      }}
                    >
                      {label}
                      <button onClick={() => handleRemoveLabel(label)} className="ml-1 text-white hover:text-gray-200">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <form onSubmit={handleAddLabel} className="flex gap-2">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Add new label"
                    className="flex-grow border rounded-md p-1 text-sm"
                    style={{
                      backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                      color: isDark ? colors.text.dark.primary : colors.text.light.primary,
                      borderColor: isDark ? colors.border.dark : colors.border.light,
                    }}
                  />
                  <button 
                    type="submit" 
                    className="px-2 py-1 rounded-md text-sm text-white"
                    style={{
                      background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                    }}
                  >
                    Add
                  </button>
                </form>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}>Links</h3>
                <ul className="space-y-1 mb-2">
                  {card.links && card.links.map((link, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm hover:underline"
                        style={{ color: isDark ? colors.primary.dark : colors.primary.light }}
                      >
                        {link}
                      </a>
                      <button onClick={() => handleRemoveLink(link)} className="text-red-500 hover:text-red-700">
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleAddLink} className="flex gap-2">
                  <input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Add new link"
                    className="flex-grow border rounded-md p-1 text-sm"
                    style={{
                      backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                      color: isDark ? colors.text.dark.primary : colors.text.light.primary,
                      borderColor: isDark ? colors.border.dark : colors.border.light,
                    }}
                  />
                  <button 
                    type="submit" 
                    className="px-2 py-1 rounded-md text-sm text-white"
                    style={{
                      background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                    }}
                  >
                    Add
                  </button>
                </form>
              </div>

              <div>
                <h3 
                  className="text-sm font-medium mb-3 flex items-center gap-2"
                  style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                >
                  <Users size={16} />
                  Assigned to
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {assignedUsers.map((userId) => {
                    const user = BOARD_USERS.find(u => u.id === userId)
                    if (!user) return null
                    
                    return (
                      <Badge 
                        key={userId}
                        className="px-3 py-1.5 text-sm font-medium flex items-center gap-2"
                        style={{
                          background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                          color: isDark ? colors.text.dark.primary : 'white',
                        }}
                      >
                        {user.name}
                        <button 
                          onClick={() => handleRemoveUser(userId)}
                          className="text-white/70 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
                <div className="flex gap-2">
                  <Select onValueChange={handleAssignUser}>
                    <SelectTrigger 
                      className="flex-1"
                      style={{
                        backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                        color: isDark ? colors.text.dark.primary : colors.text.light.primary,
                        borderColor: isDark ? colors.border.dark : colors.border.light,
                      }}
                    >
                      <SelectValue placeholder="Assign user" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                        borderColor: isDark ? colors.border.dark : colors.border.light,
                      }}
                    >
                      {BOARD_USERS
                        .filter(user => !assignedUsers.includes(user.id))
                        .map(user => (
                          <SelectItem 
                            key={user.id} 
                            value={user.id}
                            className="cursor-pointer"
                            style={{
                              color: isDark ? colors.text.dark.primary : colors.text.light.primary,
                            }}
                          >
                            {user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}>Time Tracker</h3>
                <TimeTracker cardData={card} />
              </div>

              <div className="flex items-center gap-4 text-sm mb-4">
                {card.dateTo && (
                  <div 
                    className="flex items-center"
                    style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                  >
                    <Clock size={16} className="mr-1" />
                    <span>{new Date(card.dateTo).toLocaleDateString()}</span>
                  </div>
                )}
                <button
                  onClick={handleToggleCompletion}
                  className={`flex items-center ${card.isCompleted ? 'text-green-500' : ''}`}
                  style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                >
                  <Tag size={16} className="mr-1" />
                  <span>{card.isCompleted ? 'Completed' : 'Mark as complete'}</span>
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  )
}

