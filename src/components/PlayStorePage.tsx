import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Download, Share2, Bookmark, Check, Shield, Star } from 'lucide-react';
import { ApkItem } from '../types/apk';
import { calculateValidatedMetrics } from '../utils/apkMetrics';
import { GooglePlayLogo } from './GooglePlayLogo';
import { PlayStoreDownloadCard } from './PlayStoreDownloadCard';
import { generateVectorAppIcon } from '../data/appIcons';

interface PlayStorePageProps {
  apk: ApkItem;
  onBackToAdmin?: () => void;
  onDownloadApk: (apk: ApkItem) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PlayStorePage: React.FC<PlayStorePageProps> = ({
  apk,
  onBackToAdmin,
  onDownloadApk,
  onShowToast,
}) => {
  const [votedReviews, setVotedReviews] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'Jogos' | 'Aplicativos' | 'Livros' | 'Infantil'>('Aplicativos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const metrics = calculateValidatedMetrics(apk.reviews);

  const showPlayToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleVote = (index: number) => {
    if (votedReviews[index]) return;
    setVotedReviews(prev => ({ ...prev, [index]: true }));
    showPlayToast('Obrigado pelo seu feedback!');
  };

  const mkStars = (n: number, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(n);
      const isHalf = !isFilled && i - n < 1;
      stars.push(
        <Star
          key={i}
          style={{ width: `${size}px`, height: `${size}px` }}
          className={`${
            isFilled
              ? 'fill-[#f4b400] text-[#f4b400]'
              : isHalf
              ? 'fill-[#f4b400]/40 text-[#f4b400]'
              : 'fill-[#dadce0] text-[#dadce0]'
          } shrink-0`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124] font-sans antialiased flex flex-col justify-between selection:bg-[#01875f]/20">
      {/* Top Banner for Admin Switcher (Quiet bar at top) */}
      {onBackToAdmin && (
        <div className="bg-[#111316] text-[#F5F7FA] border-b border-[#252A30] px-6 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#27B9F2]" />
            <span className="font-semibold text-[#F5F7FA]">Modo de Visualização:</span>
            <span className="text-[#9299A3]">Página de Download Pública (Play Store) para</span>
            <strong className="text-[#27B9F2] font-mono">{apk.name}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onDownloadApk(apk);
                showPlayToast(`⬇ Baixando ${apk.fileName}...`);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#191B1F] hover:bg-[#252A30] text-[#27B9F2] border border-[#252A30] rounded-[6px] text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Testar Download ({apk.fileName})</span>
            </button>

            <button
              onClick={onBackToAdmin}
              className="flex items-center gap-1.5 px-3.5 py-1 bg-[#27B9F2] hover:bg-[#38c8ff] text-[#08090B] rounded-[6px] text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Painel Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Google Play Navigation */}
      <div>
        <nav className="bg-white border-b border-[#dadce0] px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-2.5">
            <GooglePlayLogo className="w-7 h-7" />
            <span className="text-[20px] font-medium text-[#202124] tracking-tight font-['Google_Sans',sans-serif] flex items-center">
              Google <b className="text-[#01875f] font-bold ml-1.5">Play</b>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#5f6368"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <div className="w-8 h-8 rounded-full bg-[#e8eaed] flex items-center justify-center cursor-pointer border border-[#dadce0]">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#5f6368">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          </div>
        </nav>

        {/* Categories Tabs */}
        <div className="bg-white border-b border-[#dadce0] flex px-6">
          {(['Jogos', 'Aplicativos', 'Livros', 'Infantil'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-[#01875f] border-[#01875f]'
                  : 'text-[#5f6368] border-transparent hover:text-[#202124]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content Container (max-w-[900px]) */}
        <main className="max-w-[900px] mx-auto px-4 py-6 space-y-3.5">
          {/* Card 1: App Header */}
          <div className="bg-white rounded-[12px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.09)]">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={apk.iconSrc || generateVectorAppIcon(apk.name, apk.category)}
                alt={apk.name}
                className="w-[88px] h-[88px] rounded-[18px] object-cover border border-[#dadce0] shrink-0 bg-white shadow-xs select-none"
                onError={e => {
                  const target = e.currentTarget;
                  target.src = generateVectorAppIcon(apk.name, apk.category);
                }}
              />

              <div className="flex-1 min-w-0">
                <h1 className="text-[22px] font-bold text-[#202124] leading-tight mb-1 font-['Google_Sans',sans-serif]">
                  {apk.name}
                </h1>
                <p className="text-sm font-medium text-[#01875f] mb-2">{apk.company || 'Desenvolvedor'}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#f1f3f4] rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[#202124] flex items-center gap-1">
                    <span className="text-[#34a853]">●</span>
                    <span className="font-bold">{metrics.averageRating.toFixed(1).replace('.', ',')}</span>
                    <Star className="w-3 h-3 fill-[#f4b400] text-[#f4b400]" />
                  </span>
                  <span className="bg-[#f1f3f4] rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[#202124]">
                    {apk.downloads || '100K+'} Downloads
                  </span>
                  <span className="bg-[#f1f3f4] rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[#202124]">
                    Livre
                  </span>
                  <span className="bg-[#f1f3f4] rounded-full px-2.5 py-0.5 text-[11px] font-medium text-[#202124]">
                    {apk.category || 'Negócios'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Real-time Download Card */}
          <PlayStoreDownloadCard
            apk={apk}
            onDownloadApk={onDownloadApk}
            onToast={showPlayToast}
            isCompact={false}
          />

          {/* Card 3: Sobre o app / Descrição */}
          <div className="bg-white rounded-[12px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.09)] space-y-3">
            <div className="flex items-center justify-between text-base font-semibold text-[#202124] font-['Google_Sans',sans-serif]">
              <span>Sobre este app</span>
              <span className="text-sm font-normal text-[#1a73e8] cursor-pointer hover:underline">→</span>
            </div>
            <p className="text-[13px] text-[#5f6368] leading-relaxed whitespace-pre-wrap">
              {apk.description || 'Nenhuma descrição fornecida.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 bg-[#f1f3f4] text-[#5f6368] rounded-full font-medium">
                Atualizado em {apk.uploadedAt}
              </span>
              <span className="px-3 py-1 bg-[#f1f3f4] text-[#5f6368] rounded-full font-medium font-mono">
                Arquivo: {apk.fileName}
              </span>
            </div>
          </div>

          {/* Card 4: Data Safety (Segurança dos Dados) */}
          <div className="bg-white rounded-[12px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.09)] space-y-3">
            <div className="flex items-center justify-between text-base font-semibold text-[#202124] font-['Google_Sans',sans-serif]">
              <span>Segurança dos dados</span>
              <span className="text-sm font-normal text-[#1a73e8] cursor-pointer hover:underline">→</span>
            </div>
            <p className="text-[13px] text-[#5f6368] leading-relaxed">
              Sua segurança começa quando você entende como os desenvolvedores coletam e compartilham seus dados. As práticas de privacidade podem variar de acordo com o uso, a região e a idade.
            </p>

            <div className="divide-y divide-[#f1f3f4] pt-2">
              <div className="flex items-start gap-3 py-2.5">
                <div className="w-9 h-9 rounded-full bg-[#e6f4f1] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-[#01875f]" />
                </div>
                <div className="text-xs">
                  <strong className="block font-medium text-[#202124]">
                    Este app pode compartilhar estes tipos de dados com terceiros
                  </strong>
                  <span className="text-[#5f6368]">Local, Informações pessoais e dados do app</span>
                </div>
              </div>

              <div className="flex items-start gap-3 py-2.5">
                <div className="w-9 h-9 rounded-full bg-[#e6f4f1] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[#01875f]" />
                </div>
                <div className="text-xs">
                  <strong className="block font-medium text-[#202124]">
                    Dados criptografados em trânsito
                  </strong>
                  <span className="text-[#5f6368]">Seus dados são transmitidos por meio de uma conexão segura</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Ratings & Reviews (Avaliações e Opiniões) */}
          <div className="bg-white rounded-[12px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.09)] space-y-4">
            <div className="flex items-center justify-between text-base font-semibold text-[#202124] font-['Google_Sans',sans-serif]">
              <span>Avaliações e opiniões</span>
              <span className="text-sm font-normal text-[#1a73e8] cursor-pointer hover:underline">Ver todas</span>
            </div>

            {/* Ratings Top */}
            <div className="flex flex-col sm:flex-row items-center gap-7">
              <div className="flex flex-col items-center min-w-[88px]">
                <span className="text-[54px] font-bold text-[#202124] leading-none font-['Google_Sans',sans-serif]">
                  {metrics.averageRating.toFixed(1).replace('.', ',')}
                </span>
                <div className="flex gap-1 my-2">{mkStars(metrics.averageRating, 16)}</div>
                <span className="text-xs text-[#5f6368] font-mono">{metrics.totalReviewsCount} avaliações validadas</span>
              </div>

              {/* Progress bars */}
              <div className="flex-1 w-full space-y-1.5">
                {metrics.ratingBars.map(bar => (
                  <div key={bar.stars} className="flex items-center gap-2 text-xs text-[#5f6368]">
                    <span className="w-2.5 text-right font-medium">{bar.stars}</span>
                    <div className="flex-1 h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#01875f] rounded-full transition-all duration-500"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[11px]">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="divide-y divide-[#f1f3f4] pt-2">
              {apk.reviews.map((rev, idx) => (
                <div key={idx} className="py-4 space-y-1.5 first:pt-2 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#dadce0] shadow-xs bg-[#e8eaed] flex items-center justify-center">
                      {rev.avatarUrl ? (
                        <img
                          src={rev.avatarUrl}
                          alt={rev.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center font-bold text-sm text-white ${
                          rev.avatarUrl ? 'hidden' : 'flex'
                        }`}
                        style={{ backgroundColor: rev.color }}
                      >
                        {rev.initials}
                      </div>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#202124]">{rev.name}</p>
                      <p className="text-[11px] text-[#5f6368]">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex gap-0.5">{mkStars(rev.stars, 14)}</div>
                  <p className="text-[13px] text-[#5f6368] leading-relaxed">{rev.text}</p>

                  <div className="flex items-center gap-2 text-xs text-[#5f6368] pt-1">
                    <span>Isso foi útil?</span>
                    <button
                      onClick={() => handleVote(idx)}
                      className={`px-3 py-1 rounded-full border text-xs transition-colors cursor-pointer ${
                        votedReviews[idx]
                          ? 'bg-[#e6f4f1] border-[#01875f] text-[#01875f] font-medium'
                          : 'border-[#dadce0] hover:bg-[#f1f3f4] text-[#5f6368]'
                      }`}
                    >
                      Sim ({votedReviews[idx] ? rev.helpful + 1 : rev.helpful})
                    </button>
                    <button className="px-3 py-1 rounded-full border border-[#dadce0] hover:bg-[#f1f3f4] text-[#5f6368] text-xs cursor-pointer">
                      Não
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Toast Notification matching playstore_ca88e945.html */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#323232] text-white px-5 py-3 rounded-full text-sm shadow-xl z-50 transition-all duration-300 ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
};
