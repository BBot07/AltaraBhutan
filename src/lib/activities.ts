// Content for the Activities pages (/activities/[slug]) and the cards on the home page slider.
// Static content, written for the site; distances, seasons and river names are general knowledge and should be
// checked by the team before publishing.

export interface Activity {
  slug: string;
  title: string;
  /** Short line used on the home page card. */
  card: string;
  /** Card / hero photo. */
  image: string;
  /** Second photo, overlapping the first in the feature section. */
  image2: string;
  imageAlt: string;
  image2Alt: string;
  /** Position of the hero photo, e.g. "center 40%". */
  heroPosition?: string;
  metaDescription: string;
  eyebrow: string;
  /** Two-tone heading: plain part + gold part. */
  headingPlain: string;
  headingGold: string;
  intro: string;
  caption: string;
  featureEyebrow: string;
  featureHeadingPlain: string;
  featureHeadingGold: string;
  paragraphs: string[];
  expect: { title: string; text: string }[];
  facts: { value: string; label: string }[];
}

const img = (name: string) => `/assets/images/image/${name}.webp`;

export const activities: Activity[] = [
  {
    slug: 'meditation-retreats',
    title: 'Meditation Retreats',
    card: 'Guided stillness in monastery courtyards and forest hermitages, away from any itinerary.',
    image: img('04 - Chelela Pass-9'),
    image2: img('03 - Kila Goenpa-7'),
    imageAlt: 'Prayer flags on the Chele La pass above the clouds, Bhutan',
    image2Alt: 'Kila Goenpa, a mountainside monastic retreat in Bhutan',
    heroPosition: 'center 55%',
    metaDescription:
      'Private meditation retreats in Bhutan — guided stillness in monastery courtyards and forest hermitages, shaped around you by Altara Bhutan.',
    eyebrow: 'Beyond The Itinerary',
    headingPlain: 'Meditation',
    headingGold: 'Retreats',
    intro:
      'In Bhutan, meditation is not a wellness trend but a daily practice that shapes the rhythm of entire valleys. Our retreats borrow that rhythm: a few unhurried days of guided stillness in places where people have been sitting quietly for centuries, with no schedule to keep.',
    caption: 'Stillness,<br>Guided',
    featureEyebrow: 'The Practice',
    featureHeadingPlain: 'Sit Where The Mountains',
    featureHeadingGold: 'Do',
    paragraphs: [
      'Each retreat is arranged privately, around your experience and your pace. Beginners are taught the basics of breath and posture by a local teacher; those with a practice of their own are simply given the space and the setting to deepen it.',
      'Sessions take place in monastery courtyards, temple rooms and forest hermitages that are quiet by nature, high above the valley floor. Between sittings there is time to walk, to rest, and to share tea with the community that lives there — nothing is hurried, and nothing is staged.',
    ],
    expect: [
      { title: 'A Teacher, Not A Class', text: 'One-to-one guidance from a monk or an experienced lay teacher, in English, for as long as you want it.' },
      { title: 'Places Of Real Quiet', text: 'Hermitages and courtyards chosen for silence and light — not the sites on a tour bus route.' },
      { title: 'Room To Breathe', text: 'Short sittings, walks and rest woven through each day, so the practice never feels like another schedule.' },
    ],
    facts: [
      { value: '2–5', label: 'Days, Usually' },
      { value: 'Private', label: 'Just Your Party' },
      { value: 'All Levels', label: 'First-Timers Welcome' },
      { value: 'Year-Round', label: 'Spring & Autumn Clearest' },
    ],
  },
  {
    slug: 'spiritual-retreats',
    title: 'Spiritual Retreats',
    card: 'Private time with monks and lamas at sacred sites, built around reflection rather than sightseeing.',
    image: img('Dechen Phodrang Trashiyangtse'),
    image2: img('Omba Ney'),
    imageAlt: 'Dechen Phodrang monastery in Trashiyangtse, eastern Bhutan',
    image2Alt: 'A sacred pilgrimage site in Bhutan',
    heroPosition: 'center 40%',
    metaDescription:
      'Spiritual retreats in Bhutan — private time with monks and lamas at sacred sites, built around reflection rather than sightseeing.',
    eyebrow: 'Beyond The Itinerary',
    headingPlain: 'Spiritual',
    headingGold: 'Retreats',
    intro:
      'Bhutan is the last place where Vajrayana Buddhism is still the living faith of an entire kingdom. A spiritual retreat with Altara Bhutan is built around that — time with the people who keep the tradition alive, at the places that matter most to them, with space to reflect.',
    caption: 'Time With<br>The Sacred',
    featureEyebrow: 'The Journey Inward',
    featureHeadingPlain: 'A Pilgrimage, Not A',
    featureHeadingGold: 'Tour',
    paragraphs: [
      'Where a standard itinerary moves from site to site, a retreat stays. We arrange extended time at a single monastery or sacred valley, and — where the community is willing — private conversations with monks, lamas and teachers, so you can ask the questions a guidebook cannot answer.',
      'You may join a morning prayer, take part in a blessing, walk a pilgrim path or simply sit in a temple while the day goes on around you. Everything is introduced by a guide who understands the faith from the inside and knows when to speak and when to stay quiet.',
    ],
    expect: [
      { title: 'Access Through Trust', text: 'Introductions made through relationships Altara Bhutan has built over many years, never through a booking form.' },
      { title: 'Rituals In Context', text: 'Blessings, offerings and prayers explained as they happen, so they are understood rather than just observed.' },
      { title: 'Respect, Always', text: 'Quiet dress, quiet manners and no photography where it is not welcome — your guide looks after all of it.' },
    ],
    facts: [
      { value: '3–7', label: 'Days, Usually' },
      { value: 'Private', label: 'Just Your Party' },
      { value: 'Modest', label: 'Dress Is Expected' },
      { value: 'Year-Round', label: 'Festival Dates On Request' },
    ],
  },
  {
    slug: 'archery',
    title: 'Archery',
    card: "Bhutan's national sport — try a hand at the bow with village teams, chants and all.",
    image: img('Royal Highland Festival-4'),
    image2: img('Royal Highland Festival-5'),
    imageAlt: 'Archers at a highland festival in Bhutan',
    image2Alt: 'Traditional Bhutanese archery in progress',
    heroPosition: 'center 45%',
    metaDescription:
      "Try Bhutan's national sport with a private archery experience — village teams, traditional bows, songs and dance, arranged by Altara Bhutan.",
    eyebrow: 'Beyond The Itinerary',
    headingPlain: 'Bhutanese',
    headingGold: 'Archery',
    intro:
      "Archery — dha — is Bhutan's national sport and its favourite weekend pastime. It is part competition, part festival: teams trade insults across the range, women sing and dance each time a shot lands, and a match can last the whole day.",
    caption: 'The National<br>Sport',
    featureEyebrow: 'The Game',
    featureHeadingPlain: 'Aim Across The',
    featureHeadingGold: 'Valley',
    paragraphs: [
      'The targets stand well over a hundred metres apart, so a shot is as much about nerve as it is about technique. Teams shoot from one end, then walk to the other, while the opposing side shouts and sings to put them off.',
      'Altara Bhutan arranges a private session with a local team: you will be fitted with a bow, shown the stance, and taken through a few rounds before joining a friendly match. Expect a good deal of laughter, a picnic on the grass, and a few nervous moments when a real arrow flies past.',
    ],
    expect: [
      { title: 'Traditional Equipment', text: 'Bamboo and modern compound bows, so you can try the old way and the new way side by side.' },
      { title: 'A Local Team', text: 'Played with villagers or a town club who are glad to share the game — and its rituals — with visitors.' },
      { title: 'A Day, Not An Hour', text: 'Lunch, tea and rounds of local drink are part of the match; we leave the afternoon open for it.' },
    ],
    facts: [
      { value: 'Half Day', label: 'Or A Full Day' },
      { value: 'Any Age', label: 'Safety Briefing Included' },
      { value: 'Paro · Thimphu', label: 'Punakha & Beyond' },
      { value: 'Year-Round', label: 'Festival Matches In Season' },
    ],
  },
  {
    slug: 'white-water-rafting',
    title: 'White-Water Rafting',
    card: 'The Mo Chhu and Puna Tsang Chhu rivers, run privately with certified local guides.',
    image: img('rafting2'),
    image2: img('RAFTING4'),
    imageAlt: 'A raft running rapids on a Bhutanese river',
    image2Alt: 'Rafters paddling through white water in Bhutan',
    heroPosition: 'center 50%',
    metaDescription:
      'Private white-water rafting in Bhutan on the Mo Chhu and Puna Tsang Chhu rivers with certified local guides, arranged by Altara Bhutan.',
    eyebrow: 'Beyond The Itinerary',
    headingPlain: 'White-Water',
    headingGold: 'Rafting',
    intro:
      "Bhutan's rivers run cold and clear from the Himalaya through steep forested valleys, past dzongs, farms and prayer flags. A day on the water is one of the most different ways to see the country, and the quietest stretches are as memorable as the rapids.",
    caption: 'Run The<br>River',
    featureEyebrow: 'On The Water',
    featureHeadingPlain: 'Rivers That Shaped The',
    featureHeadingGold: 'Valleys',
    paragraphs: [
      'The Mo Chhu and the Puna Tsang Chhu meet beneath Punakha Dzong, and both are rafted from here: gentler stretches suit families and first-timers, while stronger sections give a more spirited ride. Your guide chooses the run to match the group and the water level on the day.',
      'Altara Bhutan arranges the trip privately, with certified local guides, helmets, life jackets and a support vehicle. You finish with a hot lunch on the riverbank, and a very good view of the dzong from the water.',
    ],
    expect: [
      { title: 'Certified Guides', text: 'Experienced local river guides, full safety briefing and equipment, and rescue-trained crews.' },
      { title: 'Runs For Every Level', text: 'Calm floats for families, livelier sections for confident paddlers — chosen on the day to suit you.' },
      { title: 'Dzong Views', text: "Punakha Dzong, one of Bhutan's most beautiful, appears around the bend where the two rivers meet." },
    ],
    facts: [
      { value: '2–4 Hrs', label: 'On The Water' },
      { value: 'Punakha', label: 'Mo Chhu & Puna Tsang Chhu' },
      { value: 'Ages 8+', label: 'Level Set By The Guide' },
      { value: 'Autumn–Spring', label: 'Water Levels Vary' },
    ],
  },
  {
    slug: 'fly-fishing',
    title: 'Fly Fishing',
    card: 'Himalayan trout in quiet river valleys — a rod, a guide, and an entire morning to yourself.',
    image: img('LLL03360'),
    image2: img('LLL03397'),
    imageAlt: 'A quiet river valley in Bhutan',
    image2Alt: 'A Bhutanese river in the morning light',
    heroPosition: 'center 45%',
    metaDescription:
      'Fly fishing for Himalayan trout in quiet Bhutan river valleys — a rod, a guide and a whole morning, arranged privately by Altara Bhutan.',
    eyebrow: 'Beyond The Itinerary',
    headingPlain: 'Fly',
    headingGold: 'Fishing',
    intro:
      "Trout swim in many of Bhutan's rivers, and very few people fish for them. A morning on the bank here is quiet in a way that is hard to find anywhere else: cold water, thin air, and nothing to hear but the river.",
    caption: 'A Rod,<br>A River',
    featureEyebrow: 'The Catch',
    featureHeadingPlain: 'Quiet Water, Few',
    featureHeadingGold: 'Anglers',
    paragraphs: [
      'Bhutan is a catch-and-release country, and the fishing is gentle on the river and on the angler. Altara Bhutan arranges access to quieter stretches of valley rivers with a local guide who knows where the fish lie and how they behave in each season.',
      'Beginners are taught to cast on the bank before wading in; experienced anglers are given the water and the time. Equipment can be arranged if you would rather not travel with your own, and breakfast or lunch is taken beside the river.',
    ],
    expect: [
      { title: 'Rivers Few People Fish', text: 'Quiet beats of valley rivers in Paro, Haa and central Bhutan, chosen with the season and conditions in mind.' },
      { title: 'Catch And Release', text: 'Fishing is practised with respect for the river; permits and the details are arranged for you.' },
      { title: 'A Guide On The Bank', text: 'Casting lessons for beginners, local knowledge for experts, and a thermos of tea either way.' },
    ],
    facts: [
      { value: 'Half Day', label: 'Or A Full Day' },
      { value: 'Trout', label: 'Brown & Rainbow' },
      { value: 'All Levels', label: 'Lessons Available' },
      { value: 'Spring · Autumn', label: 'Best Seasons' },
    ],
  },
  {
    slug: 'mountain-biking',
    title: 'Mountain Biking',
    card: 'Farm-road descents and highland singletrack, with a support vehicle never far behind.',
    image: img('bycycle'),
    image2: img('bikeing2'),
    imageAlt: 'A mountain biker on a Bhutanese road',
    image2Alt: 'Mountain biking through the Bhutanese countryside',
    heroPosition: 'center 55%',
    metaDescription:
      'Mountain biking in Bhutan — farm-road descents and highland singletrack with a support vehicle and local guide, arranged by Altara Bhutan.',
    eyebrow: 'Beyond The Itinerary',
    headingPlain: 'Mountain',
    headingGold: 'Biking',
    intro:
      "Bhutan's roads wind through forests, rice terraces and high passes, past villages that only a bike moves slowly enough to see. Whether you want a long descent or a day on high singletrack, a two-wheeled journey here is as scenic as it is rewarding.",
    caption: 'Two Wheels,<br>One Valley',
    featureEyebrow: 'On The Trail',
    featureHeadingPlain: 'Ride Where The Roads',
    featureHeadingGold: 'Wind',
    paragraphs: [
      'Routes range from relaxed rides along farm roads in Paro and Haa to the long, forested descent from Dochu La toward Punakha, and the open valleys of Bumthang. Each day is planned around your fitness and appetite for climbing.',
      'A support vehicle follows every ride, carrying water, spares and your bags, and picks you up whenever you have had enough. Altara Bhutan can arrange quality mountain bikes, helmets and a guide who knows the surface and the weather.',
    ],
    expect: [
      { title: 'Routes To Suit You', text: 'From gentle valley rides to long, rolling descents and high-pass climbs — designed around your fitness.' },
      { title: 'A Support Vehicle', text: 'Never far behind: for water, repairs, a rest, or a lift up the steep parts.' },
      { title: 'Villages On The Way', text: 'Tea stops, farmhouse lunches and monastery detours turn each ride into a day, not just an exercise.' },
    ],
    facts: [
      { value: '2–6 Hrs', label: 'In The Saddle' },
      { value: 'Bikes + Gear', label: 'Provided On Request' },
      { value: 'All Levels', label: 'Easy To Challenging' },
      { value: 'Spring · Autumn', label: 'Best Seasons' },
    ],
  },
  {
    slug: 'bird-watching',
    title: 'Bird Watching',
    card: "Over 700 species, including the black-necked crane — tracked with Bhutan's own naturalists.",
    image: img('birdwatching5'),
    image2: img('birdwatching10'),
    imageAlt: 'A bird in the forests of Bhutan',
    image2Alt: 'A Bhutanese bird photographed in its habitat',
    heroPosition: 'center 40%',
    metaDescription:
      "Bird watching in Bhutan — over 700 species, including the black-necked crane, tracked with Bhutan's own naturalists. Arranged by Altara Bhutan.",
    eyebrow: 'Beyond The Itinerary',
    headingPlain: 'Bird',
    headingGold: 'Watching',
    intro:
      "With forest covering most of the country and habitats rising from subtropical plains to alpine meadows, Bhutan is home to more than 700 recorded species of birds. It is one of the great quiet destinations for anyone with a pair of binoculars.",
    caption: 'Wings Over<br>The Kingdom',
    featureEyebrow: 'The Birds',
    featureHeadingPlain: 'Seven Hundred Species,',
    featureHeadingGold: 'One Kingdom',
    paragraphs: [
      'Each winter, black-necked cranes migrate from the Tibetan plateau to the Phobjikha Valley, and the arrival is celebrated with a festival in November. Elsewhere, the forests hold hornbills, trogons, pheasants and many species that are rare or hard to find across the Himalaya.',
      'Altara Bhutan pairs you with one of Bhutan’s naturalist guides, who knows where and when to look, and shapes the days around your interests — a single valley for a relaxed trip, or a long journey across several habitats for a serious list.',
    ],
    expect: [
      { title: 'Naturalist Guides', text: 'Local experts with sharp eyes and ears, who know the calls, the habits and the best trails.' },
      { title: 'Cranes In Phobjikha', text: 'Time with the black-necked cranes that winter in the valley, from November through February.' },
      { title: 'Unhurried Days', text: 'Early starts, long pauses and quiet lunches in the field, with a flexible plan around the weather.' },
    ],
    facts: [
      { value: '700+', label: 'Species Recorded' },
      { value: '2–10', label: 'Days, Your Choice' },
      { value: 'Phobjikha', label: 'Black-Necked Cranes' },
      { value: 'Year-Round', label: 'Cranes: Nov–Feb' },
    ],
  },
];

export const activityBySlug = (slug: string) => activities.find((a) => a.slug === slug);
