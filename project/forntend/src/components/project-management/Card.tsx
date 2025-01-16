"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Card as CardType } from "@/services/cardService"
import { Clock, Tag } from 'lucide-react'
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { colors } from "../cardcolor"
import TimeTracker from './TimeTracker'
import { Badge } from "@/components/ui/badge"

interface CardProps {
  card: CardType
  index: number
  onClick: (cardId: string) => void
}

export default function Card({ card, index, onClick }: CardProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div
              className="rounded-lg p-3 cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: isDark ? colors.card.dark.background : colors.card.light.background,
                boxShadow: snapshot.isDragging 
                  ? `0 10px 15px -3px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}` 
                  : isDark ? colors.shadow.dark : colors.shadow.light,
              }}
              onClick={() => onClick(card.id)}
            >
              <h4 
                className="font-medium mb-2"
                style={{
                  color: isDark ? colors.text.dark.primary : colors.text.light.primary
                }}
              >
                {card.title}
              </h4>
              {card.description && (
                <p 
                  className="text-sm mb-2 line-clamp-2"
                  style={{
                    color: isDark ? colors.text.dark.secondary : colors.text.light.secondary
                  }}
                >
                  {card.description}
                </p>
              )}
              {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {card.labels.slice(0, 3).map((label, index) => (
                    <Badge 
                      key={index}
                      className="px-2 py-0.5 text-xs font-medium"
                      style={{
                        background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                        color: 'white',
                      }}
                    >
                      {label}
                    </Badge>
                  ))}
                  {card.labels.length > 3 && (
                    <Badge 
                      variant="outline" 
                      className="px-2 py-0.5 text-xs"
                      style={{
                        borderColor: isDark ? colors.border.dark : colors.border.light,
                        color: isDark ? colors.text.dark.secondary : colors.text.light.secondary,
                      }}
                    >
                      +{card.labels.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                {card.dateTo && (
                  <div 
                    className="flex items-center gap-1"
                    style={{
                      color: isDark ? colors.text.dark.secondary : colors.text.light.secondary
                    }}
                  >
                    <Clock size={12} />
                    <span>{new Date(card.dateTo).toLocaleDateString()}</span>
                  </div>
                )}
                {card.isCompleted && (
                  <Badge 
                    className="flex items-center gap-1 px-2 py-0.5"
                    style={{
                      background: isDark ? colors.primary.gradient.dark : colors.primary.gradient.light,
                      color: 'white',
                    }}
                  >
                    <Tag size={12} />
                    <span className="text-xs">Complete</span>
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <TimeTracker cardData={card} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  )
}

