"use client"

// 1. Import the things we need
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useParams, notFound, useRouter } from "next/navigation"
import { Menu, Plus, Settings } from 'lucide-react'
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import ListItem from "@tiptap/extension-list-item"
import FontFamily from '@tiptap/extension-font-family'
import { teamService, Team } from "@/services/teamService"
import docsService from "@/services/docsService"
import { colors } from "@/components/colors"
import DocItem from "@/components/DocItem"
import { DocsDTO } from "@/types/DocsDTO"
import { ThemeWrapper } from "@/components/basic/theme-wrapper"
import { MenuBar } from "@/components/ui/editor/menu-bar"

import styles from "./DocDetailsPage.module.css"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// 2. Add axios for the Gemini API request
import axios from "axios"

export default function DocDetailsPage() {
  const { theme } = useTheme()
  const params = useParams()
  const router = useRouter()

  const officeId = params.id as string
  const teamId = params.teamId as string
  const docsId = params.docsId as string

  // 3. States for team, docs, doc
  const [team, setTeam] = useState<Team | null>(null)
  const [teamLoading, setTeamLoading] = useState<boolean>(true)
  const [teamError, setTeamError] = useState<string | null>(null)

  const [docs, setDocs] = useState<DocsDTO[]>([])
  const [docsLoading, setDocsLoading] = useState<boolean>(true)
  const [docsError, setDocsError] = useState<string | null>(null)

  const [doc, setDoc] = useState<DocsDTO | null>(null)
  const [docLoading, setDocLoading] = useState<boolean>(true)
  const [docError, setDocError] = useState<string | null>(null)

  // 4. Additional states for document logic
  const [title, setTitle] = useState("")
  const [isAddChildOpen, setIsAddChildOpen] = useState(false)
  const [newChildDocTitle, setNewChildDocTitle] = useState("")
  const [newChildDocContent, setNewChildDocContent] = useState("")

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  // 5. This is your Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color.configure({
        types: [TextStyle.name, "listItem"],
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "list-item",
        },
      }),
      FontFamily.configure({
        types: [TextStyle.name, "listItem"],
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  })

  // 6. Fetch the team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await teamService.getTeam(teamId)
        setTeam(data)
      } catch (err) {
        console.error(err)
        setTeamError("Failed to fetch team details.")
        notFound()
      } finally {
        setTeamLoading(false)
      }
    }
    fetchTeam()
  }, [teamId])

  // 7. Fetch the docs (root docs)
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const allDocs = await docsService.getDocsByTeamId(teamId)
        const rootDocs = allDocs.filter((d) => !d.parentId)
        setDocs(rootDocs)
      } catch (err) {
        console.error(err)
        setDocsError("Failed to fetch documents.")
      } finally {
        setDocsLoading(false)
      }
    }
    fetchDocs()
  }, [teamId])

  // 8. Fetch the specific doc by ID
  useEffect(() => {
    const fetchDocById = async () => {
      try {
        const docData = await docsService.getDocById(docsId)
        setDoc(docData)
        setTitle(docData.title)
        editor?.commands.setContent(docData.content)
      } catch (err) {
        console.error(err)
        setDocError("Failed to fetch doc details.")
        notFound()
      } finally {
        setDocLoading(false)
      }
    }
    fetchDocById()
  }, [docsId, editor])

  // 9. This function updates your docs tree after adding a child
  const handleDocAdded = (newDoc: DocsDTO, parentId: string) => {
    setDocs((prevDocs) => {
      if (parentId === null) {
        return [...prevDocs, newDoc]
      }
      const updatedDocs = prevDocs.map((d) => {
        if (d.id === parentId) {
          return {
            ...d,
            children: d.children ? [...d.children, newDoc] : [newDoc],
          }
        }
        return d
      })
      return updatedDocs
    })
  }

  // 10. Toggle sidebars
  const toggleLeftSidebar = () => setLeftSidebarOpen(!leftSidebarOpen)
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen)

  // 11. Update the doc in the database
  const handleUpdateDoc = async () => {
    try {
      if (!doc || !editor) return
      const updatedDoc = await docsService.updateDoc(doc.id, {
        title,
        content: editor.getHTML(),
      })
      setDoc(updatedDoc)
      alert("Document updated successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to update document.")
    }
  }

  // 12. Create a new child doc
  const handleCreateChildDoc = async () => {
    try {
      const newDoc = await docsService.createDoc({
        teamId,
        officeId,
        parentId: doc?.id || null,
        title: newChildDocTitle,
        content: newChildDocContent,
        level: (doc?.level || 0) + 1,
      })

      if (doc) {
        setDoc({
          ...doc,
          children: doc.children ? [...doc.children, newDoc] : [newDoc],
        })
      }

      setDocs((prevDocs) => {
        const updatedDocs = prevDocs.map((d) => {
          if (d.id === newDoc.parentId) {
            return {
              ...d,
              children: d.children ? [...d.children, newDoc] : [newDoc],
            }
          }
          return d
        })
        return updatedDocs
      })

      setNewChildDocTitle("")
      setNewChildDocContent("")
      setIsAddChildOpen(false)

      router.push(`/office/${officeId}/team/${teamId}/docs/${newDoc.id}`)
    } catch (err) {
      console.error(err)
      alert("Failed to create child document.")
    }
  }

  // 13. The text-prompt feature states & logic:
  // -------------------------------------------------

  // (a) We store which text is selected
  const [selectedText, setSelectedText] = useState<string>("")

  // (b) We store a flag whether the Prompt Dialog is open or not
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)

  // (c) Store the text response from the Gemini API
  const [promptResponse, setPromptResponse] = useState("")

  // (d) Store a loading/processing state
  const [isProcessing, setIsProcessing] = useState(false)

  // (e) Same Gemini API key
  const apiKeyGemini = "AIzaSyC6WC7v6rYTZmKXe6uLyWo86xSb76vJqY8"

  // (f) We'll listen for the user pressing the "U" key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user pressed 'U' or 'u'
      if (event.key === "u" || event.key === "U") {
        const selection = window.getSelection()?.toString() || ""
        // If something is selected, open the dialog and store the text
        if (selection.trim().length > 0) {
          setSelectedText(selection)
          setPromptResponse("") // clear previous response
          setIsPromptDialogOpen(true)
        }
      }
    }

    // Attach the event listener
    window.addEventListener("keydown", handleKeyDown)

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // (g) This function chooses what to ask Gemini
  const getPromptForOption = (option: string, text: string): string => {
    // Remove all '*' symbols from the text using regex
    const cleanText = text.replace(/\*+/g, '')
  
    switch (option) {
      case "Rewrite":
        return `Rewrite the following text in a different style, maintaining the same meaning: "${cleanText}"`
      case "Explain":
        return `Explain the following text in simple terms: "${cleanText}"`
      case "Summary":
        return `Provide a concise summary of the following text: "${cleanText}"`
      case "Grammar":
        return `Fix any grammar issues in the following text and explain the corrections: "${cleanText}"`
      default:
        return ""
    }
  }

  // (h) This function hits the Gemini API with the chosen prompt
  const processText = async (option: string) => {
    if (!selectedText) return
    setIsProcessing(true)
    setPromptResponse("") // Clear any old response

    try {
      const prompt = getPromptForOption(option, selectedText)
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKeyGemini}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      )

      // The Gemini response is usually in `response.data.candidates[0].content.parts[0].text`
      const badresult = response.data.candidates[0].content.parts[0].text
      const result = badresult.replace(/\*/g, '')
      setPromptResponse(result)
    } catch (error) {
      console.error(`Error with Gemini API request for ${option}:`, error)
      setPromptResponse(
        `Sorry - Something went wrong with the Gemini API for ${option}. Please try again!`
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // -------------------------------------------------
  // End of text-prompt feature states & logic
  // 14. Render logic: loading states
  if (teamLoading || docLoading) {
    return (
      <ThemeWrapper>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-lg font-medium">Loading...</p>
          </div>
        </div>
      </ThemeWrapper>
    )
  }

  if (teamError || !team) {
    return (
      <ThemeWrapper>
        <div className={styles.container}>
          <p className={styles.error}>{teamError || "Team not found."}</p>
        </div>
      </ThemeWrapper>
    )
  }

  if (docError || !doc) {
    return (
      <ThemeWrapper>
        <div className={styles.container}>
          <p className={styles.error}>{docError || "Document not found."}</p>
        </div>
      </ThemeWrapper>
    )
  }

  // 15. Theme-based styling
  const themeTextStyle = {
    color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
  }

  const themeInputStyle = {
    backgroundColor:
      theme === "dark" ? colors.background.dark.end : colors.background.light.end,
    color: theme === "dark" ? colors.text.dark.primary : colors.text.light.primary,
    borderColor: theme === "dark" ? colors.border.dark : colors.border.light,
  }

  // 16. Finally, we render the page
  return (
    <ThemeWrapper>
      <div className={styles.container}>
        {/* Left Sidebar Toggle */}
        <button
          onClick={toggleLeftSidebar}
          className={`${styles.sidebarToggle} ${
            leftSidebarOpen ? styles.leftToggleTransform : styles.leftToggle
          }`}
          style={{
            backgroundColor: colors.button.primary.default,
            ...themeTextStyle,
          }}
          aria-label="Toggle left sidebar"
        >
          <Menu size={24} />
        </button>

        <div className={styles.content}>
          {/* Left Sidebar */}
          <div
            className={`${styles.sidebar} ${styles.leftSidebar} ${
              leftSidebarOpen ? styles.open : ""
            }`}
            style={{
              backgroundColor:
                theme === "dark"
                  ? colors.background.dark.end
                  : colors.background.light.end,
            }}
          >
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle} style={themeTextStyle}>
                Docs
              </h2>
            </div>
            <div className={styles.docsList}>
              {docsLoading && <p style={themeTextStyle}>Loading documents...</p>}
              {docsError && <p className={styles.error}>{docsError}</p>}
              {!docsLoading && !docsError && docs.length === 0 && (
                <p style={themeTextStyle}>No documents available.</p>
              )}
              {!docsLoading && !docsError && docs.length > 0 && (
                <ul className={styles.docList}>
                  {docs.map((d) => (
                    <DocItem
                      key={d.id}
                      doc={d}
                      teamId={teamId}
                      officeId={officeId}
                      onDocAdded={handleDocAdded}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            <h1 className={styles.title} style={themeTextStyle}>
              {team.name} / {doc.title}
            </h1>

            <div className={styles.docForm}>
              <label htmlFor="docTitle" style={themeTextStyle}>
                Title
              </label>
              <input
                id="docTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={themeInputStyle}
                className={styles.titleInput}
              />

              <MenuBar editor={editor} />

              <EditorContent
                editor={editor}
                className={styles.editor}
                style={themeInputStyle}
              />

              <button
                onClick={handleUpdateDoc}
                className={styles.updateButton}
                style={{
                  backgroundColor: colors.button.primary.default,
                  color: colors.button.text,
                }}
              >
                Update Document
              </button>
            </div>

            {/* Add Child Document Dialog */}
            <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
              <DialogTrigger asChild>
                <Button
                  className={styles.addChildButton}
                  style={{
                    backgroundColor: colors.button.primary.default,
                    color: colors.button.text,
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Child Document
                </Button>
              </DialogTrigger>
              <DialogContent style={themeInputStyle}>
                <DialogHeader>
                  <DialogTitle style={themeTextStyle}>
                    Create New Child Document
                  </DialogTitle>
                </DialogHeader>
                <div className={styles.dialogContent}>
                  <div>
                    <Input
                      placeholder="Document Title"
                      value={newChildDocTitle}
                      onChange={(e) => setNewChildDocTitle(e.target.value)}
                      style={themeInputStyle}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Document Content"
                      value={newChildDocContent}
                      onChange={(e) => setNewChildDocContent(e.target.value)}
                      className={styles.childDocContent}
                      style={themeInputStyle}
                    />
                  </div>
                  <Button
                    className={styles.createDocButton}
                    onClick={handleCreateChildDoc}
                    disabled={!newChildDocTitle || !newChildDocContent}
                    style={{
                      backgroundColor: colors.button.primary.default,
                      color: colors.button.text,
                    }}
                  >
                    Create Document
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Right Sidebar */}
          <div
            className={`${styles.sidebar} ${styles.rightSidebar} ${
              rightSidebarOpen ? styles.open : ""
            }`}
            style={{
              backgroundColor:
                theme === "dark"
                  ? colors.background.dark.end
                  : colors.background.light.end,
            }}
          >
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle} style={themeTextStyle}>
                Options
              </h2>
            </div>
            <div className={styles.placeholderContent}>
              <p style={themeTextStyle}>No options available.</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar Toggle */}
        <button
          onClick={toggleRightSidebar}
          className={`${styles.sidebarToggle} ${
            rightSidebarOpen ? styles.rightToggleTransform : styles.rightToggle
          }`}
          style={{
            backgroundColor: colors.button.primary.default,
            ...themeTextStyle,
          }}
          aria-label="Toggle right sidebar"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* 17. The Prompt Dialog for "Rewrite", "Explain", "Summary", "Grammar" */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent style={themeInputStyle}>
          <DialogHeader>
            <DialogTitle style={themeTextStyle}>
              Text Prompt Options
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: "1rem", textAlign: "center" }}>
            <p style={themeTextStyle}>
              <strong>Selected Text:</strong> {selectedText}
            </p>
            <div style={{ margin: "1rem 0" }}>
              <Button
                onClick={() => processText("Rewrite")}
                style={{
                  backgroundColor: colors.button.primary.default,
                  color: colors.button.text,
                  margin: "0.5rem",
                }}
              >
                Rewrite
              </Button>
              <Button
                onClick={() => processText("Explain")}
                style={{
                  backgroundColor: colors.button.primary.default,
                  color: colors.button.text,
                  margin: "0.5rem",
                }}
              >
                Explain
              </Button>
              <Button
                onClick={() => processText("Summary")}
                style={{
                  backgroundColor: colors.button.primary.default,
                  color: colors.button.text,
                  margin: "0.5rem",
                }}
              >
                Summary
              </Button>
              <Button
                onClick={() => processText("Grammar")}
                style={{
                  backgroundColor: colors.button.primary.default,
                  color: colors.button.text,
                  margin: "0.5rem",
                }}
              >
                Grammar
              </Button>
            </div>

            {isProcessing ? (
              <p style={themeTextStyle}>Processing...</p>
            ) : (
              promptResponse && (
                <div
                  style={{
                    marginTop: "1rem",
                    border: "1px solid #ccc",
                    padding: "1rem",
                    borderRadius: "4px",
                    backgroundColor: themeInputStyle.backgroundColor,
                    color: themeInputStyle.color,
                  }}
                >
                  <h3 style={themeTextStyle}>Result:</h3>
                  <p style={{ whiteSpace: "pre-wrap" }}>{promptResponse}</p>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ThemeWrapper>
  )
}

