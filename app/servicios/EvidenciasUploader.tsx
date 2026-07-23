'use client'

import { useState, useRef } from 'react'
import { UploadCloud, FileText, Image as ImageIcon, File, Trash2, Eye, Paperclip, CheckCircle2, AlertCircle } from 'lucide-react'

export type EvidenciaItem = {
  id: string
  nombre: string
  tipo: string
  url: string
  tamanio?: number
  fecha?: string
}

function formatoTamanio(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function EvidenciasUploader({
  evidencias,
  onChange,
}: {
  evidencias: EvidenciaItem[]
  onChange: (evidencias: EvidenciaItem[]) => void
}) {
  const [cargando, setCargando] = useState(false)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setErrorArchivo(null)
    setCargando(true)

    const nuevasEvidencias: EvidenciaItem[] = []
    let procesados = 0

    Array.from(files).forEach((file) => {
      // Limit file size to 8MB per file for smooth base64 encoding
      if (file.size > 8 * 1024 * 1024) {
        setErrorArchivo(`El archivo "${file.name}" supera el tamaño máximo permitido de 8 MB.`)
        procesados++
        if (procesados === files.length) setCargando(false)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        if (url) {
          nuevasEvidencias.push({
            id: 'ev_' + Math.random().toString(36).substr(2, 9),
            nombre: file.name,
            tipo: file.type || 'application/octet-stream',
            url: url,
            tamanio: file.size,
            fecha: new Date().toISOString().split('T')[0],
          })
        }
        procesados++
        if (procesados === files.length) {
          onChange([...evidencias, ...nuevasEvidencias])
          setCargando(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }

      reader.onerror = () => {
        setErrorArchivo(`Error leyendo el archivo ${file.name}`)
        procesados++
        if (procesados === files.length) setCargando(false)
      }

      reader.readAsDataURL(file)
    })
  }

  function eliminarEvidencia(id: string) {
    onChange(evidencias.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-3 pt-2 border-t border-[var(--nav-border)]">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="h-4 w-4 text-blue-500" />
          <span>Evidencias y Adjuntos (Facturas, Fotos, PDF)</span>
        </label>
        {evidencias.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            {evidencias.length} adjunto(s)
          </span>
        )}
      </div>

      <p className="text-xs text-[var(--nav-text)] leading-relaxed">
        Adjunta facturas, fotos de repuestos, cotizaciones o reportes en PDF/imagen para tener constancia física del servicio.
      </p>

      {/* Botón / Zona de carga */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--input-border)] hover:border-blue-500/50 rounded-xl p-4 text-center cursor-pointer bg-[var(--background)] hover:bg-blue-500/5 transition-all group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />

        <UploadCloud className="h-7 w-7 mx-auto text-blue-500/70 group-hover:scale-110 transition-transform mb-1.5" />
        <p className="text-xs font-bold text-[var(--foreground)]">
          {cargando ? 'Procesando archivos...' : 'Haz clic para adjuntar facturas o fotos'}
        </p>
        <p className="text-[11px] text-[var(--nav-text)] mt-0.5">
          Soporta imágenes (JPG, PNG, WEBP) y documentos (PDF, Excel, Word)
        </p>
      </div>

      {errorArchivo && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorArchivo}</span>
        </div>
      )}

      {/* Lista de evidencias subidas */}
      {evidencias.length > 0 && (
        <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
          {evidencias.map((item) => {
            const esImagen = item.tipo.startsWith('image/')
            const esPdf = item.tipo.includes('pdf') || item.nombre.toLowerCase().endsWith('.pdf')

            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-[var(--nav-border)] bg-[var(--background)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {esImagen ? (
                    <div className="h-9 w-9 rounded-lg overflow-hidden bg-slate-900 border border-[var(--nav-border)] flex-shrink-0 flex items-center justify-center">
                      <img src={item.url} alt={item.nombre} className="h-full w-full object-cover" />
                    </div>
                  ) : esPdf ? (
                    <div className="h-9 w-9 rounded-lg bg-red-500/15 text-red-500 border border-red-500/30 flex-shrink-0 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-blue-500/15 text-blue-500 border border-blue-500/30 flex-shrink-0 flex items-center justify-center">
                      <File className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--foreground)] truncate text-xs">{item.nombre}</p>
                    <p className="text-[10px] text-[var(--nav-text)] font-mono">
                      {formatoTamanio(item.tamanio)} {item.fecha ? `• ${item.fecha}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-[var(--nav-border)] text-[var(--nav-text)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors"
                    title="Ver en vista previa"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => eliminarEvidencia(item.id)}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Eliminar archivo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
