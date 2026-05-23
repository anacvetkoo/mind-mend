import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, FileText, RefreshCw, Search, User } from 'lucide-react';
import { getTherapistClientFiles } from '../../services/clientFiles';
import type { ClientFileSummary } from '../../types/clientFiles';

interface ClientFilesScreenProps {
  therapistId: string;
  onOpenClientFile: (userId: string) => void;
}

export function ClientFilesScreen({ therapistId, onOpenClientFile }: ClientFilesScreenProps) {
  const [clientFiles, setClientFiles] = useState<ClientFileSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadClientFiles = async () => {
    if (!therapistId) {
      setClientFiles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getTherapistClientFiles(therapistId);
      setClientFiles(data);
    } catch (error) {
      console.error('Failed to load client files:', error);
      setClientFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientFiles();
  }, [therapistId]);

  const filteredClientFiles = clientFiles.filter((clientFile) => {
    const searchValue = searchTerm.toLowerCase().trim();
    if (!searchValue) return true;

    return clientFile.userName.toLowerCase().includes(searchValue) ||
      clientFile.userEmail?.toLowerCase().includes(searchValue);
  });

  const formatDate = (date?: string) => {
    if (!date) return 'No sessions yet';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl text-foreground">Clients</h1>
              <p className="text-muted-foreground mt-1">View your client files</p>
            </div>

            <button
              onClick={loadClientFiles}
              className="w-10 h-10 rounded-full bg-card border border-[var(--border)] flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search clients"
            className="w-full bg-card border-2 border-[var(--border)] rounded-2xl pl-12 pr-4 py-3 text-foreground outline-none focus:border-[var(--lavender)] transition-colors"
          />
        </motion.div>

        {isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto mb-4 animate-spin opacity-60" />
            <p className="text-muted-foreground">Loading client files...</p>
          </div>
        ) : filteredClientFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg text-foreground mb-2">No client files yet</h3>
            <p className="text-sm text-muted-foreground">
              Client files appear after clients book appointments with you.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredClientFiles.map((clientFile, idx) => (
              <motion.button
                key={clientFile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenClientFile(clientFile.userId)}
                className="w-full bg-card rounded-2xl p-4 shadow-md hover:shadow-xl transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {clientFile.userPhotoURL ? (
                      <img
                        src={clientFile.userPhotoURL}
                        alt={clientFile.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-[var(--lavender)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-foreground truncate">{clientFile.userName}</h3>
                        {clientFile.userEmail && (
                          <p className="text-sm text-muted-foreground truncate">{clientFile.userEmail}</p>
                        )}
                      </div>

                      <span className="px-3 py-1 rounded-full bg-[var(--soft-mint)]/20 text-green-700 dark:text-green-400 text-xs capitalize">
                        {clientFile.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-[var(--muted)] rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">Sessions</p>
                        <p className="text-sm text-foreground">{clientFile.totalSessions}</p>
                      </div>

                      <div className="bg-[var(--muted)] rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">Last session</p>
                        <p className="text-sm text-foreground">{formatDate(clientFile.lastAppointment?.date)}</p>
                      </div>
                    </div>

                    {clientFile.nextAppointment && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Next: {formatDate(clientFile.nextAppointment.date)} at {clientFile.nextAppointment.startTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
