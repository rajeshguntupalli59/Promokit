'use client';

import { useState } from 'react';

interface Props {
  businessType: string;
  businessName: string;
  language?: string;
}

// Curated hashtag packs by business category
const HASHTAG_DB: Record<string, { niche: string[]; local: string[]; trending: string[] }> = {
  restaurant: {
    niche: ['#foodie', '#foodphotography', '#instafood', '#foodlover', '#homemade', '#delicious', '#foodblogger', '#yummy', '#tasty', '#freshfood', '#foodgram', '#foodstagram'],
    local: ['#indianfood', '#desi', '#streetfood', '#thali', '#biryani', '#swad', '#gharkaखाना', '#desikhana', '#indianrestaurant'],
    trending: ['#FoodieIndia', '#IndianFoodie', '#HomeCooking', '#FoodPhotography', '#FoodBloggerIndia'],
  },
  clothing: {
    niche: ['#fashion', '#style', '#ootd', '#fashionista', '#clothing', '#outfit', '#womensfashion', '#fashionblogger', '#streetstyle', '#ethnic', '#traditional'],
    local: ['#indianfashion', '#ethnicwear', '#saree', '#kurti', '#salwarkameez', '#designerwear', '#bollywoodstyle', '#indianwear'],
    trending: ['#IndianFashion', '#EthnicWear', '#FashionBloggerIndia', '#SareeTwitter', '#OOTD'],
  },
  grocery: {
    niche: ['#organic', '#fresh', '#healthy', '#vegetables', '#fruits', '#groceries', '#localmarket', '#farmfresh', '#natural', '#wholesome'],
    local: ['#freshvegetables', '#organicfood', '#sabzi', '#mandi', '#localmarket', '#desifarmer', '#farmtotable'],
    trending: ['#HealthyEating', '#FreshProduce', '#OrganicIndia', '#FarmToTable', '#LocalBusiness'],
  },
  electronics: {
    niche: ['#tech', '#gadgets', '#electronics', '#technology', '#mobile', '#laptop', '#smartphone', '#techreviews', '#newtech'],
    local: ['#madeinindia', '#indiatech', '#techIndia', '#startupindia', '#digitalbharat'],
    trending: ['#TechIndia', '#Gadgets', '#SmartPhone', '#TechDeals', '#Electronics'],
  },
  beauty: {
    niche: ['#beauty', '#skincare', '#makeup', '#glam', '#beautyblogger', '#selfcare', '#skincareroutine', '#glowing', '#natural', '#beautytips'],
    local: ['#indianbeauty', '#fairness', '#bridal', '#mehendi', '#ayurvedic', '#herbal', '#desi'],
    trending: ['#BeautyIndia', '#SkincareRoutine', '#GlowUp', '#NaturalBeauty', '#BridalMakeup'],
  },
  jewelry: {
    niche: ['#jewelry', '#jewellery', '#gold', '#silver', '#diamond', '#handmade', '#accessories', '#necklace', '#earrings', '#bangles'],
    local: ['#indianjewelry', '#traditionaljewelry', '#goldenjewelry', '#templeyjewelry', '#kundan', '#polki', '#meenakari'],
    trending: ['#JewelleryIndia', '#GoldJewellery', '#HandmadeJewelry', '#BridalJewelry', '#TraditionalJewellery'],
  },
  fitness: {
    niche: ['#fitness', '#gym', '#workout', '#health', '#healthy', '#motivation', '#fitlife', '#exercise', '#yoga', '#training', '#fitfam'],
    local: ['#indianfitness', '#yogaindia', '#gymlife', '#fitnessindia', '#healthylifestyle', '#desifit'],
    trending: ['#FitnessMotivation', '#GymLife', '#WorkoutIndia', '#YogaIndia', '#HealthyLifestyle'],
  },
  education: {
    niche: ['#education', '#learning', '#students', '#school', '#study', '#knowledge', '#teaching', '#teachers', '#classroom', '#skills'],
    local: ['#indianeducation', '#students', '#iit', '#neet', '#upsc', '#coaching', '#onlineeducation', '#cbse'],
    trending: ['#StudyMotivation', '#OnlineLearning', '#IndiaEducation', '#LearnWithUs', '#SkillIndia'],
  },
  medical: {
    niche: ['#health', '#wellness', '#doctor', '#healthcare', '#medical', '#medicine', '#clinic', '#patients', '#healthy'],
    local: ['#indiandoctor', '#healthindia', '#ayurveda', '#homoeopathy', '#hospital', '#clinic', '#wellnessindia'],
    trending: ['#HealthcareIndia', '#WellnessIndia', '#DoctorIndia', '#MedicalAdvice', '#StayHealthy'],
  },
};

function getBestPack(businessType: string): { niche: string[]; local: string[]; trending: string[] } {
  const lower = businessType.toLowerCase();
  for (const [key, pack] of Object.entries(HASHTAG_DB)) {
    if (lower.includes(key)) return pack;
  }
  // Generic fallback
  return {
    niche: ['#business', '#smallbusiness', '#entrepreneur', '#sale', '#offer', '#deals', '#quality', '#trusted', '#bestprice', '#localshop'],
    local: ['#india', '#madeinindia', '#localbusiness', '#supportlocal', '#shoplocal', '#indianbusiness', '#startupindia'],
    trending: ['#SmallBusiness', '#SupportLocal', '#ShopLocal', '#IndianBusiness', '#Entrepreneur'],
  };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
      style={copied
        ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {copied ? '✓ Copied' : 'Copy All'}
    </button>
  );
}

export default function HashtagPack({ businessType, businessName }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const pack = getBestPack(businessType);

  function toggle(tag: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  function selectAll(tags: string[]) {
    setSelected(prev => { const next = new Set(prev); tags.forEach(t => next.add(t)); return next; });
  }

  const selectedStr = Array.from(selected).join(' ');
  const businessTag = '#' + businessName.replace(/\s+/g, '');

  const sections = [
    { label: '🎯 Niche', tags: pack.niche },
    { label: '🇮🇳 Local', tags: pack.local },
    { label: '🔥 Trending', tags: pack.trending },
  ];

  return (
    <div className="mt-4 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-white text-sm">Hashtag Pack</h4>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Tap to select · Copy to clipboard</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{selected.size} selected</span>
          {selectedStr && <CopyButton text={selectedStr + ' ' + businessTag} />}
        </div>
      </div>

      {sections.map(sec => (
        <div key={sec.label} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>{sec.label}</span>
            <button onClick={() => selectAll(sec.tags)} className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(255,107,26,0.1)', color: 'rgba(255,107,26,0.8)' }}>
              Add All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sec.tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150"
                style={selected.has(tag)
                  ? { background: 'rgba(255,107,26,0.2)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.45)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Business-specific tag */}
      <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Your branded hashtag:</p>
        <button
          onClick={() => toggle(businessTag)}
          className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          style={selected.has(businessTag)
            ? { background: 'rgba(99,102,241,0.2)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.4)' }
            : { background: 'rgba(99,102,241,0.08)', color: 'rgba(129,140,248,0.6)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {businessTag}
        </button>
      </div>

      {selectedStr && (
        <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{selectedStr} {businessTag}</p>
        </div>
      )}
    </div>
  );
}
