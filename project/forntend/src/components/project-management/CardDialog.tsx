"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { cardService, Card } from "@/services/cardService"
import { X, Clock, Tag, Plus } from 'lucide-react'
import TimeTracker from './TimeTracker'
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { colors } from "../cardcolor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CardDialogProps {
  cardId: string
  isOpen: boolean
  onClose: () => void
}

export default function CardDialog({ cardId, isOpen, onClose }: CardDialogProps) {
  const [card, setCard] = useState<Card | null>(null)
  const [newLabel, setNewLabel] = useState("")
  const [newLink, setNewLink] = useState("")
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
          className="w-full max-w-2xl"
        >
          <Dialog.Panel 
            className="rounded-xl shadow-xl overflow-hidden"
            style={{
              backgroundColor: isDark ? colors.list.dark.background : colors.list.light.background,
            }}
          >
            <div 
              className="flex justify-between items-center p-6"
              style={{
                background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
              }}
            >
              <Dialog.Title className="text-xl font-semibold text-white">
                {card.title}
              </Dialog.Title>
              <button 
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
              <div>
                <h3 
                  className="text-sm font-medium mb-3"
                  style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                >
                  Description
                </h3>
                <p 
                  className="text-base"
                  style={{ color: isDark ? colors.text.dark.primary : colors.text.light.primary }}
                >
                  {card.description || "No description provided."}
                </p>
              </div>

              <div>
                <h3 
                  className="text-sm font-medium mb-3"
                  style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                >
                  Labels
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {card.labels && card.labels.map((label, index) => (
                    <Badge 
                      key={index}
                      className="px-3 py-1.5 text-sm font-medium flex items-center gap-2"
                      style={{
                        background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                        color: isDark ? colors.text.dark.primary : 'white',
                      }}
                    >
                      {label}
                      <button 
                        onClick={() => handleRemoveLabel(label)}
                        className="text-white/70 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <form onSubmit={handleAddLabel} className="flex gap-2">
                  <Input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Add new label"
                    className="flex-1"
                    style={{
                      backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                      color: isDark ? colors.text.dark.primary : colors.text.light.primary,
                      borderColor: isDark ? colors.border.dark : colors.border.light,
                    }}
                  />
                  <Button 
                    type="submit"
                    className="gap-2"
                    style={{
                      background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                    }}
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </form>
              </div>

              <div>
                <h3 
                  className="text-sm font-medium mb-3"
                  style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                >
                  Links
                </h3>
                <div className="space-y-2 mb-3">
                  {card.links && card.links.map((link, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                      }}
                    >
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm hover:underline"
                        style={{ color: isDark ? colors.primary.dark : colors.primary.light }}
                      >
                        {link}
                      </a>
                      <button 
                        onClick={() => handleRemoveLink(link)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddLink} className="flex gap-2">
                  <Input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Add new link"
                    className="flex-1"
                    style={{
                      backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                      color: isDark ? colors.text.dark.primary : colors.text.light.primary,
                      borderColor: isDark ? colors.border.dark : colors.border.light,
                    }}
                  />
                  <Button 
                    type="submit"
                    className="gap-2"
                    style={{
                      background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                    }}
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </form>
              </div>

              <div>
                <h3 
                  className="text-sm font-medium mb-3"
                  style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                >
                  Time Tracker
                </h3>
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                  }}
                >
                  <TimeTracker cardData={card} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-6 border-t" style={{ borderColor: isDark ? colors.border.dark : colors.border.light }}>
                {card.dateTo && (
                  <div 
                    className="flex items-center gap-2"
                    style={{ color: isDark ? colors.text.dark.secondary : colors.text.light.secondary }}
                  >
                    <Clock size={20} />
                    <span className="text-sm">{new Date(card.dateTo).toLocaleDateString()}</span>
                  </div>
                )}
                <Button
                  onClick={handleToggleCompletion}
                  variant="outline"
                  className="gap-2"
                  style={{
                    borderColor: isDark ? colors.border.dark : colors.border.light,
                    color: card.isCompleted 
                      ? (isDark ? colors.primary.dark : colors.primary.light)
                      : (isDark ? colors.text.dark.secondary : colors.text.light.secondary)
                  }}
                >
                  <Tag size={16} />
                  <span>{card.isCompleted ? 'Completed' : 'Mark as complete'}</span>
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  )
}
