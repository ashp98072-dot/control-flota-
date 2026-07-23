'use client'

import { useState } from 'react'
import { Paperclip, FileText, File, Download, ExternalLink, X, Eye, Image as ImageIcon } from 'lucide-react'
import { EvidenciaItem } from './EvidenciasUploader'

function formatoTamanio(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function EvidenciasModal({
  evidencias,
  placa,
  tipoTrabajo,
}: {
  evidencias: EvidenciaItem[]
  placa?: string
  tipoTrabajo?: string
}) {
  const [abierto, setAbierto] = useState(false)
  const [previewItem, setPreviewItem] = useState<EvidenciaItem | null>(null)

  if (!evidencias || evidencias.length === 0) {
    return <span className="opacity-40 text-xs">—</span>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition-all"
      >
        <Paperclip className="h-3.5 w-3.5" />
        <span>{evidencias.length} evidencia(s)</span>
      </button>

      {/* Modal Principal de Evidencias */}
      {abierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--nav-bg)] text-[var(--foreground)] border border-[var(--nav-border)] rounded-2xl p-5 w-full max-w-lg space-y-4 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--nav-border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-blue-500" />
                  <span>Evidencias del Servicio</span>
                </h3>
                <p className="text-xs text-[var(--nav-text)] mt-0.5">
                  {placa ? `Vehículo: ${placa}` : ''} {tipoTrabajo ? `• ${tipoTrabajo}` : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="p-1.5 rounded-lg border border-[var(--nav-border)] text-[var(--nav-text)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {evidencias.map((item) => {
                const esImagen = item.tipo?.startsWith('image/')
                const esPdf = item.tipo?.includes('pdf') || item.nombre.toLowerCase().endsWith('.pdf')

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-[var(--nav-border)] bg-[var(--background)] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {esImagen ? (
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-900 border border-[var(--nav-border)] flex-shrink-0 flex items-center justify-center">
                            <img src={item.url} alt={item.nombre} className="h-full w-full object-cover" />
                          </div>
                        ) : esPdf ? (
                          <div className="h-10 w-10 rounded-lg bg-red-500/15 text-red-500 border border-red-500/30 flex-shrink-0 flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-blue-500/15 text-blue-500 border border-blue-500/30 flex-shrink-0 flex items-center justify-center">
                            <File className="h-5 w-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[var(--foreground)] truncate">{item.nombre}</p>
                          <p className="text-[10px] text-[var(--nav-text)] font-mono">
                            {formatoTamanio(item.tamanio)} {item.fecha ? `• ${item.fecha}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {esImagen && (
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-semibold flex items-center gap-1"
                            title="Vista Previa"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Ver</span>
                          </button>
                        )}

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          download={item.nombre}
                          className="p-1.5 rounded-lg border border-[var(--nav-border)] text-[var(--foreground)] hover:bg-[var(--card)] text-xs font-semibold flex items-center gap-1"
                          title="Abrir o Descargar"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Descargar</span>
                        </a>
                      </div>
                    </div>

                    {/* Quick Inline Image Preview */}
                    {esImagen && (
                      <div
                        onClick={() => setPreviewItem(item)}
                        className="cursor-pointer rounded-lg overflow-hidden border border-[var(--nav-border)] max-h-40 bg-black/40 flex items-center justify-center group relative"
                      >
                        <img src={item.url} alt={item.nombre} className="max-h-40 object-contain w-full" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                          <Eye className="h-4 w-4" />
                          <span>Amplicar foto</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[var(--nav-border)] flex justify-end">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="px-4 py-2 rounded-xl border border-[var(--nav-border)] text-xs font-bold text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Image Zoom */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-10 right-0 flex items-center gap-2">
              <a
                href={previewItem.url}
                download={previewItem.nombre}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 text-xs flex items-center gap-1 font-bold"
              >
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <img
              src={previewItem.url}
              alt={previewItem.nombre}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white text-xs mt-2 font-medium bg-black/50 px-3 py-1 rounded-full">
              {previewItem.nombre} ({formatoTamanio(previewItem.tamanio)})
            </p>
          </div>
        </div>
      )}
    </>
  )
}
