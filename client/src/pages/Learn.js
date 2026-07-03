import React, { useState } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  Box, Chip, Accordion, AccordionSummary, AccordionDetails,
  Avatar, Paper, Divider, Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import RecyclingIcon from '@mui/icons-material/Recycling';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import EcoIcon from '@mui/icons-material/EnergySavingsLeaf';
import GavelIcon from '@mui/icons-material/Gavel';
import SchoolIcon from '@mui/icons-material/School';

const CATEGORIES = [
  { id: 'feed', label: 'Animal Feed', icon: <AgricultureIcon />, color: '#fff3e0', iconColor: '#e65100' },
  { id: 'compost', label: 'Composting', icon: <RecyclingIcon />, color: '#e8f5e9', iconColor: '#2e7d32' },
  { id: 'safety', label: 'Food Safety', icon: <HealthAndSafetyIcon />, color: '#e3f2fd', iconColor: '#1565c0' },
  { id: 'legal', label: 'Data & Legal', icon: <GavelIcon />, color: '#f3e5f5', iconColor: '#6a1b9a' },
];

const RESOURCES = {
  feed: [
    {
      q: 'Which fruits and vegetables are safe as poultry feed?',
      a: `Most fresh fruit and vegetable waste is suitable — tomatoes, peppers, leafy greens, 
yam peels, plantain skins, pineapple cores, mango peels, and watermelon rinds are all 
commonly fed to poultry in Nigeria with good results. Avoid mouldy, fermented, or 
chemically treated produce. Citrus peels should be fed in limited quantities (under 10% 
of diet) due to high acidity.`,
    },
    {
      q: 'How should I prepare vegetable waste before feeding it to poultry?',
      a: `Chop or shred large pieces to reduce palatability issues and choking risk. Remove 
any packaging, rubber bands, or non-organic material. Rinse produce that may have been 
exposed to pesticides. Feed fresh — do not store uncovered waste for more than 24 hours 
in Nigerian heat, as bacterial spoilage is rapid. Sun-drying excess waste for 1–2 days 
reduces moisture content and extends shelf life.`,
    },
    {
      q: 'How much fruit/veg waste can I substitute for commercial feed?',
      a: `As a rule of thumb, fresh vegetable waste should not exceed 20–30% of total 
daily feed intake for layers and broilers. Higher proportions can dilute energy and 
protein, reducing egg production and growth rate. Introduce new waste gradually over 
5–7 days to allow the gut flora to adjust. Always ensure access to clean water, grit, 
and a balanced concentrate feed.`,
    },
    {
      q: 'What waste should I never feed to poultry?',
      a: `Avoid: avocado (persin toxin — fatal to birds), onion and garlic in large 
amounts (haemolytic anaemia), raw potato and green tomato (solanine toxin), heavily 
salted waste, processed or spiced food, rotten or mouldy produce, caffeine (tea/coffee 
grounds), and any meat or dairy products (attract pests and promote Salmonella).`,
    },
    {
      q: 'Can I use vegetable waste for fish farming (aquaculture)?',
      a: `Leaf meal, duckweed, and aquatic vegetable offcuts can supplement tilapia and 
catfish diets. Fermented cassava leaves or moringa leaf powder are used in research 
settings. However, vegetable waste alone will not meet protein requirements — pair with 
fishmeal or soybean cake. Ensure any waste fed to ponds is free of synthetic pesticides 
which can bioaccumulate and harm consumers.`,
    },
  ],
  compost: [
    {
      q: 'What is the carbon-to-nitrogen (C:N) ratio and why does it matter?',
      a: `The C:N ratio determines how fast your compost will decompose. A ratio of 
25–30:1 is ideal. Fruit and vegetable waste is nitrogen-rich (roughly 10–15:1) — 
so pair it with carbon-rich "browns" like dry leaves, cardboard, or sawdust. 
Without browns, your pile will smell of ammonia and decompose slowly. A simple rule: 
for every bucket of wet vegetable waste, add one bucket of dry browns.`,
    },
    {
      q: 'How long does fruit and vegetable waste take to compost?',
      a: `With active turning (every 3–5 days), a well-managed hot compost pile can 
produce finished compost in 4–6 weeks in Nigeria's warm climate. Without turning, 
expect 3–6 months. Shredding waste smaller accelerates breakdown significantly. 
Temperatures between 55–65°C inside the pile kill pathogens and weed seeds — use a 
compost thermometer to verify.`,
    },
    {
      q: 'How do I prevent my compost from smelling bad?',
      a: `Bad smells usually mean too much nitrogen (ammonia smell) or too much moisture 
(sulphur/rotten smell). Fix ammonia smell: add more carbon (dry leaves, shredded paper). 
Fix rotten smell: turn the pile to add oxygen and mix in dry material. Ensure your 
compost bin has adequate drainage holes. Cover fresh additions with a layer of browns 
to discourage flies.`,
    },
    {
      q: 'Can I compost citrus peels and onion skins?',
      a: `Yes — both are fully compostable. Contrary to popular belief, citrus peels do 
not harm earthworms in reasonable quantities. Onion skins add useful minerals. Chop 
or shred citrus peels to speed breakdown (the waxy rind can be slow). Avoid adding 
diseased plant material or produce treated with systemic pesticides.`,
    },
    {
      q: 'How do I know my compost is ready to use?',
      a: `Finished compost: looks like dark, crumbly soil; smells earthy (like forest 
floor); original materials are no longer recognisable; temperature has dropped to 
ambient. Apply at 2–5 kg per square metre of garden bed, or mix into potting soil 
at 20–30% by volume. Do not apply unfinished compost directly to plant roots — it 
can burn them.`,
    },
  ],
  safety: [
    {
      q: 'What photos should I upload to verify my waste quality?',
      a: `Good verification photos show: (1) the waste clearly in daylight without heavy 
filtering, (2) the quantity (weight on a scale or filled container), (3) any separation 
between waste types (e.g. tomatoes separate from leafy greens). Avoid photos that are 
blurry, dark, or taken days before pickup. Honest photos build your rating and trust score.`,
    },
    {
      q: 'What are my responsibilities as a waste vendor on ReVora?',
      a: `You are responsible for: ensuring waste is free of non-organic materials 
(packaging, rubber bands, stickers), keeping listed quantities accurate, making waste 
available at the agreed pickup time, and disclosing any pesticide applications within 
the last 14 days. ReVora does not take responsibility for waste quality — this is a 
peer-to-peer platform. Your ratings reflect your reliability.`,
    },
    {
      q: 'What should farmers check before accepting a collection?',
      a: `Before accepting: confirm the waste matches the listing photos; check for signs 
of mould, unusual smell, or pest damage; ask the vendor if any chemicals were applied; 
weigh or estimate the quantity. You are entitled to refuse waste that does not match 
the listing. Submit a 1-star rating with a clear comment if the vendor misrepresented 
quality — this protects future users.`,
    },
    {
      q: 'How does ReVora handle disputes between users?',
      a: `ReVora is a matching platform — all exchanges are direct between users and 
we do not facilitate payments. Disputes should first be resolved directly through 
the in-app chat. If a vendor consistently misrepresents waste, report via the rating 
system. Repeated low ratings trigger an admin review. For serious issues, contact 
support and an admin can intervene, remove listings, or deactivate accounts.`,
    },
  ],
  legal: [
    {
      q: 'What personal data does ReVora collect?',
      a: `ReVora collects: name, email address, phone number (optional), approximate 
location (latitude/longitude for matching), profile photos (optional), and transaction 
history (listings, requests, ratings). We do not collect payment information. All data 
collection requires your explicit consent at registration, recorded with a timestamp.`,
    },
    {
      q: 'How is my data stored and who can see it?',
      a: `Your data is stored on MongoDB Atlas servers (ISO 27001 certified) with 
encryption at rest and in transit (TLS 1.3). Your exact coordinates are never displayed 
to other users — only your city/area. Your email and phone are never visible to other 
users. Admins can access user records for moderation purposes only.`,
    },
    {
      q: 'Can I delete my account and data?',
      a: `Yes. Email support with your registered email address and request account 
deletion. We will remove your profile, listings, and personal identifiers within 
30 days in compliance with NDPR Article 3.1(9). Anonymised transaction records 
(without personal data) may be retained for research and platform improvement.`,
    },
    {
      q: 'Is ReVora compliant with the Nigeria Data Protection Regulation (NDPR)?',
      a: `Yes. ReVora was designed from the ground up with NDPR compliance: lawful basis 
(consent) for all data processing, data minimisation (we collect only what is needed), 
purpose limitation (data used only for matching and trust), right to access and 
deletion, and a privacy notice presented at registration. Our Data Controller is the 
project team at [university name].`,
    },
  ],
};

const TIPS = [
  { icon: '🌡️', title: 'Hot composting', tip: 'Turn your pile every 3 days and aim for 55–65°C inside — this kills pathogens and seeds.' },
  { icon: '🐓', title: 'Poultry portion rule', tip: 'Keep vegetable waste under 25% of daily feed to maintain protein and energy balance.' },
  { icon: '📸', title: 'Photo tips', tip: 'Shoot in natural daylight, show the quantity clearly — good photos get 40% more requests.' },
  { icon: '⭐', title: 'Build your rating', tip: 'Respond to requests within 2 hours and be punctual for pickups — the two biggest rating drivers.' },
  { icon: '🌧️', title: 'Rainy season storage', tip: 'During rains, cover compost piles and move listings indoors — waterlogged waste goes anaerobic fast.' },
  { icon: '🤝', title: 'Build relationships', tip: 'Regular vendors and farmers who exchange repeatedly develop trust faster than one-off transactions.' },
];

export default function Learn() {
  const [activeCategory, setActiveCategory] = useState('feed');

  return (
    <Box sx={{ bgcolor: '#f8faf9', minHeight: '100vh', pb: 8 }}>
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg,#1b4332,#40916c)', color: '#fff', py: { xs: 6, md: 8 }, mb: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 52, color: '#74c69d', mb: 2 }} />
          <Typography variant="h3" fontWeight={800} mb={1}>Learning centre</Typography>
          <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.85 }}>
            Animal feed safety, composting guides, platform tips and data rights
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Quick tips */}
        <Typography variant="h5" fontWeight={700} mb={3}>Quick tips</Typography>
        <Grid container spacing={2} mb={6}>
          {TIPS.map((t) => (
            <Grid item xs={12} sm={6} md={4} key={t.title}>
              <Paper sx={{ p: 2.5, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'flex-start', height: '100%' }}>
                <Typography sx={{ fontSize: 28 }}>{t.icon}</Typography>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t.title}</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{t.tip}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mb: 5 }} />

        {/* Category selector */}
        <Typography variant="h5" fontWeight={700} mb={3}>Guides & FAQs</Typography>
        <Box display="flex" gap={1.5} flexWrap="wrap" mb={4}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              icon={<Box sx={{ color: `${cat.iconColor} !important`, display: 'flex' }}>{cat.icon}</Box>}
              label={cat.label}
              onClick={() => setActiveCategory(cat.id)}
              sx={{
                px: 1, py: 2.5, fontSize: 14, fontWeight: 600,
                bgcolor: activeCategory === cat.id ? cat.color : 'transparent',
                border: '1.5px solid',
                borderColor: activeCategory === cat.id ? cat.iconColor : 'divider',
                color: activeCategory === cat.id ? cat.iconColor : 'text.secondary',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: cat.color },
              }}
            />
          ))}
        </Box>

        {/* Accordion FAQs */}
        <Box mb={6}>
          {RESOURCES[activeCategory]?.map((item, i) => (
            <Accordion
              key={i}
              disableGutters
              elevation={0}
              sx={{
                mb: 1.5, borderRadius: '10px !important', border: '1.5px solid',
                borderColor: 'divider', overflow: 'hidden',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                sx={{ px: 3, py: 1.5, '&:hover': { bgcolor: '#f8faf9' } }}
              >
                <Typography variant="body1" fontWeight={600}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, bgcolor: '#fafafa', borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" lineHeight={1.85} sx={{ whiteSpace: 'pre-line' }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* CTA box */}
        <Paper sx={{ p: 4, bgcolor: '#f0faf4', borderRadius: 3, textAlign: 'center' }}>
          <EcoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>Ready to start exchanging?</Typography>
          <Typography color="text.secondary" mb={3}>
            Join vendors, farmers and composters already building Nigeria's circular food economy.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button component="a" href="/listings" variant="contained" size="large">Browse listings</Button>
            <Button component="a" href="/register" variant="outlined" size="large">Join free</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
