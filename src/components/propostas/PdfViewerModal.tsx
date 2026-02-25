import { X, FileText, Upload } from 'lucide-react';
import { Proposal } from './services/proposalsApi';

interface PdfViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposal: Proposal | null;
}

function getPdfUrl(proposal: Proposal): string | null {
    // Priority: user-uploaded PDF > system-generated PDF
    if (proposal.uploaded_pdf_path) {
        const path = proposal.uploaded_pdf_path;
        // Handle /storage/proposals/... paths (new storage location)
        if (path.startsWith('/storage/proposals/')) {
            return `/api${path}`;
        }
        // Handle /uploads/... paths (legacy location)
        if (path.startsWith('/uploads/')) {
            return `/api${path}`;
        }
    }

    if (proposal.pdf_path) {
        const path = proposal.pdf_path;
        if (path.startsWith('/uploads/')) {
            return `/api${path}`;
        }
    }

    return null;
}

function getPdfLabel(proposal: Proposal): string {
    if (proposal.uploaded_pdf_path) return 'PDF enviado pelo usuário';
    if (proposal.pdf_path) return 'PDF gerado pelo sistema';
    return '';
}

export function PdfViewerModal({ isOpen, onClose, proposal }: PdfViewerModalProps) {
    if (!isOpen || !proposal) return null;

    const pdfUrl = getPdfUrl(proposal);
    const pdfLabel = getPdfLabel(proposal);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col" style={{ height: '90vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 shrink-0">
                    <div className="flex items-center gap-3">
                        <FileText size={22} className="text-orange-500" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Proposta #{proposal.id} — {proposal.titulo}
                            </h2>
                            {pdfLabel && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pdfLabel}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title={`PDF da Proposta #${proposal.id}`}
                            className="w-full h-full border-0"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                                <Upload size={28} className="text-orange-400" />
                            </div>
                            <div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
                                    Nenhum PDF disponível
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-md">
                                    Faça upload de um PDF no cadastro da proposta ou clique em <strong>"Salvar e Enviar"</strong> para que o sistema gere o documento automaticamente ao enviar o e-mail.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
