import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config();

import { prisma } from "../src/lib/db";

const BOOKS = [
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    category: "Fiction",
    description: "A gripping, heart-wrenching tale of coming-of-age in the American South during the 1930s. Through the eyes of young Scout Finch, Harper Lee explores the injustice of racial prejudice and the loss of innocence.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    coverTone: "from-amber-200 via-orange-100 to-yellow-100",
    bookAccess: "free",
    format: "eBook",
    pages: 281,
    quantity: 5,
    available: 5,
    shelfLocation: "Section A - Shelf 1",
    chapters: [
      { title: "The Start of Something", content: "When I was nearly thirteen, I got my first gun. My father, Atticus Finch, told me that I could shoot all the bluejays I wanted, but I had to remember that it was a sin to kill a mockingbird.\n\nThat was the first time I heard the word 'sin' used in a serious context. I asked Miss Maudie about it, and she confirmed that Atticus was right. Mockingbirds don't do one thing except make music for us to enjoy. They don't eat up people's gardens, don't nest in corncribs, they don't do one thing but sing their hearts out for us.\n\nMaycomb was an old town, but it was a tired old town when I first knew it. In rainy weather the streets turned to red slop; grass grew on the sidewalks, the courthouse sagged in the square. Somehow it was hotter then; dogs lingered on the sidewalks; the main street was lined with bare earth that turned to mud with every rain.\n\nPeople moved slowly then. They ambled across the square, shuffled in and out of the stores around it, took their time about everything. A day was twenty-four hours long but seemed longer. There was no hurry, for there was nowhere to go, nothing to buy and no money to buy it with, nothing to see outside the boundaries of Maycomb County.", position: 0 },
      { title: "The Mad Dog", content: "Summer was our best season: it was a time when school was out and we moved from the back porch to the front yard. Our taciturn neighbor, Mr. Radley, kept to himself and so did his son Boo.\n\nOne day a mad dog came down the street. It was a rabid dog, stumbling and lurching along. Tim Johnson, the rabid dog, came listing down the sidewalk. The street was empty. Nobody was about.\n\nAtticus told us to stay inside and not come out. He walked toward the dog with a calm determination. The dog was getting closer, its movements becoming more erratic. Atticus raised his rifle and took aim.\n\nThe rifle cracked. The dog jumped and crumpled in the dust. The street was still and silent. Atticus had saved us all.", position: 1 },
      { title: "The Trial", content: "The trial of Tom Robinson was the most important event in Maycomb that year. Tom was a colored man accused of hurting Mayella Ewell, a young white woman. Atticus was appointed to defend him.\n\nThe courtroom was packed. People sat in the balcony, in the chairs reserved for witnesses, and stood along the walls. The air was thick with tension and expectation.\n\nAtticus presented his case with quiet dignity. He showed that Mayella's injuries could not have been caused by Tom's left hand, which was crippled. He revealed that Bob Ewell, Mayella's father, was left-handed.\n\nThe jury deliberated for hours. When they finally came back, they found Tom Robinson guilty. Atticus walked out of the courtroom with his head high, knowing he had done everything he could.", position: 2 },
      { title: "The End of Innocence", content: "On Halloween night, Scout and Jem walked home from the school pageant. It was dark and the street was empty. Suddenly someone grabbed Jem. A scuffle ensued.\n\nA stranger carried Jem home. It was Boo Radley, the mysterious neighbor who had lived behind the Radley house for years. He had saved the children from Bob Ewell's attack.\n\nThat night, Scout stood on Boo's porch and looked out at the street. She saw the world from his perspective, and she understood the kindness he had shown them all along.\n\nSome things happen that change your life forever. Scout had lost her innocence but gained something far more valuable: understanding and compassion for others.", position: 3 },
    ],
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-451-52493-5",
    category: "Fiction",
    description: "A dystopian masterpiece about a totalitarian society where Big Brother watches over everyone. Winston Smith fights against the oppressive regime that controls truth, language, and thought itself.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
    coverTone: "from-red-200 via-rose-100 to-pink-100",
    bookAccess: "free",
    format: "eBook",
    pages: 328,
    quantity: 4,
    available: 4,
    shelfLocation: "Section A - Shelf 2",
    chapters: [
      { title: "The World of Oceania", content: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions.\n\nThe hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.\n\nThis was Big Brother. The face gazed down from every commanding corner. There was one on the house-front immediately opposite. BIG BROTHER IS WATCHING YOU, the caption beneath it ran.\n\nWinston kept his back turned to the telescreen. It was safer; though, as he well knew, even a back can be revealing.", position: 0 },
      { title: "The Diary", content: "Winston sat down at the table and opened the diary. This was not illegal, but if discovered it was reasonably certain that it would be punished by death.\n\nHe wrote the date: April 4th, 1984. He pressed the pen to the paper and hesitated. What was he going to write? The thoughts in his head were formless and confused.\n\nDOWN WITH BIG BROTHER, he wrote over and over again. The words were a prayer, almost. He was committing thoughtcrime, and he knew it. The Thought Police would get him just as surely as they always got everyone.\n\nBut writing it down gave him a strange feeling of courage. The paper was warm against his fingertips. For the first time in years, he felt alive.", position: 1 },
      { title: "The Brotherhood", content: "Winston and Julia met in the countryside, away from the telescreens and the prying eyes of the Thought Police. She was a dark-haired girl of about twenty-seven, with a bold and rebellious spirit.\n\nI belong to the Brotherhood, Winston told her. We are fighting against the Party. Against Big Brother.\n\nJulia looked at him with interest. She reached into her pocket and produced a small capsule of gin. They sat together in the clearing and talked about the future, about what the world could be like if they were free.\n\nThe Brotherhood was real. O'Brien, a Party member, had confirmed it. There was hope, even in the darkest of times.", position: 2 },
      { title: "Room 101", content: "They caught him. Of course they did. They always did. Winston sat in the hard chair in the Ministry of Love, staring at the blank wall.\n\nO'Brien stood before him, holding the cage with the rat. Winston could smell the metal and the fear. The rats were scratching at the bars, their eyes gleaming with hunger.\n\nYou will do it, O'Brien said. Or we will let them loose. They will eat your face.\n\nWinston screamed. He screamed for mercy. He screamed for Julia. He screamed until his voice broke and there was nothing left inside him but the hollow echo of betrayal.\n\nHe loved Big Brother.", position: 3 },
    ],
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0-553-38016-3",
    category: "Science",
    description: "A landmark volume in science writing that explores the mysteries of the universe — from the Big Bang to black holes — written in language that anyone can understand.",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
    coverTone: "from-blue-200 via-indigo-100 to-violet-100",
    bookAccess: "free",
    format: "eBook",
    pages: 212,
    quantity: 3,
    available: 3,
    shelfLocation: "Section B - Shelf 1",
    chapters: [
      { title: "Our Picture of the Universe", content: "A well-known scientist once gave a public lecture on astronomy. He described how the earth orbits around the sun and how the sun, in turn, orbits around the center of a vast collection of stars called our galaxy.\n\nAt the end of the lecture, a little old lady at the back of the room got up and said: What you have told us is rubbish. The world is really a flat plate supported on the back of a giant tortoise.\n\nThe scientist smiled and replied: What is the tortoise standing on? You're very clever, very clever, said the old lady. But it's turtles all the way down!\n\nMost people would find the picture of our universe as an infinite tower of tortoises rather ridiculous, but why do we think we know better?", position: 0 },
      { title: "The Expanding Universe", content: "If you look at the night sky, you will see that the stars appear to be in fixed positions. But astronomers discovered that the universe is expanding — every galaxy is moving away from every other galaxy.\n\nThe distance between galaxies is increasing with time. This means that in the past, the galaxies were closer together. If we trace the expansion backward, everything must have started from a single point of enormous density and temperature.\n\nThis was the Big Bang — the moment when the universe began. About fifteen billion years ago, all the matter and energy in the universe was concentrated in a space smaller than a proton.\n\nIn an instant, space itself began to expand, carrying matter and energy outward in a cosmic explosion that continues to this day.", position: 1 },
      { title: "Black Holes", content: "A black hole is a region of space where gravity is so strong that nothing, not even light, can escape. If you throw a rock into a black hole, it will disappear and never come back.\n\nImagine throwing a stone into a very deep well. If the well is deep enough and the sides steep enough, the stone will disappear from sight and you will never see it again. A black hole is like that, but even more extreme.\n\nBlack holes are formed when massive stars collapse at the end of their lives. The gravity at the surface becomes so intense that the star contracts to an infinitely small point called a singularity.\n\nEven though we cannot see black holes directly, we can detect them by their gravitational effects on nearby stars and matter.", position: 2 },
      { title: "The Arrow of Time", content: "Why do we remember the past but not the future? Why does time seem to flow in only one direction?\n\nThe laws of physics are symmetric in time. If you filmed two billiard balls colliding and played the film backward, it would look equally natural. The laws of physics don't distinguish between past and future.\n\nBut in our everyday experience, there is a clear arrow of time. Eggs break but don't unbreak. Ice melts but doesn't spontaneously freeze. Coffee cools but doesn't heat up.\n\nThe answer lies in entropy — the measure of disorder in a system. The second law of thermodynamics states that entropy always increases with time. This is what gives time its direction.", position: 3 },
    ],
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    category: "Fiction",
    description: "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, set against the backdrop of the roaring twenties in New York.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
    coverTone: "from-emerald-200 via-teal-100 to-cyan-100",
    bookAccess: "free",
    format: "eBook",
    pages: 180,
    quantity: 4,
    available: 4,
    shelfLocation: "Section A - Shelf 3",
    chapters: [
      { title: "The Green Light", content: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had.\n\nHe didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.\n\nGatsby turned out all right at the end; it is what preyed on Gatsby, what foul dust floated in the wake of his dreams.\n\nI decided to call to him. Miss Baker had mentioned him at dinner, and that would do for an introduction. But I didn't call to him, for he gave a sudden intimation that he was content to be alone.", position: 0 },
      { title: "The Party", content: "Every Friday five crates of oranges and lemons arrived from a fruiterer in New York — every Monday these same oranges and lemons left his back door in a pyramid of pulpless halves.\n\nThere was music from my neighbor's house through the summer nights. In his blue gardens men and girls came and went like moths among the whisperings and the champagne and the stars.\n\nI was within and without, simultaneously enchanted and repelled by the inexhaustible variety of life.\n\nThe bar is in full swing, and floating rounds of cocktails permeate the garden outside, until the air is alive with chatter and laughter, and casual innuendo and introductions forgotten on the spot.", position: 1 },
      { title: "The Valley of Ashes", content: "About halfway between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land.\n\nThis is a valley of ashes — a fantastic farm where ashes grow like wheat into ridges and hills and grotesque gardens; where ashes take the forms of houses and chimneys and rising smoke.\n\nThe eyes of Doctor T. J. Eckleburg, blue and gigantic — their retinas are one yard high. They look out of no face, but, instead, from a pair of enormous yellow spectacles which pass over a nonexistent nose.\n\nBut his eyes, dimmed a little by many paintless days, under sun and rain, brood on over the solemn dumping ground.", position: 2 },
      { title: "The Dream Fades", content: "He must have looked up at an unfamiliar sky through frightening leaves and shivered as he found what a grotesque thing a rose is and how raw the sunlight was upon the scarcely created grass.\n\nThe wind blew through the house, carrying the last echoes of Gatsby's dream. The garden was still and silent. The pool, which had been Gatsby's great pride, lay empty and undisturbed.\n\nGatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter — tomorrow we will run faster, stretch out our arms farther.\n\nAnd one fine morning — So we beat on, boats against the current, borne back ceaselessly into the past.", position: 3 },
    ],
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "978-0-06-231609-7",
    category: "History",
    description: "An exploration of how Homo sapiens came to dominate Earth, covering the Cognitive Revolution, the Agricultural Revolution, and the Scientific Revolution.",
    coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
    coverTone: "from-amber-200 via-orange-100 to-yellow-100",
    bookAccess: "paid",
    price: 14,
    format: "eBook",
    pages: 443,
    quantity: 3,
    available: 3,
    shelfLocation: "Section C - Shelf 1",
    chapters: [
      { title: "An Animal of No Significance", content: "About 13.5 billion years ago, matter, energy, time and space came into being in what is known as the Big Bang. The story of these fundamental features of our universe is called physics.\n\nAbout 300,000 years after their appearance, matter and energy started to coalesce into complex structures called atoms, which then combined into molecules. The story of the atoms, molecules and their interactions is called chemistry.\n\nAbout 3.8 billion years ago, on a planet called Earth, certain molecules combined to form particularly large structures called organisms. The story of organisms is called biology.\n\nAbout 70,000 years ago, organisms belonging to the species Homo sapiens started to form even more elaborate structures called cultures. The subsequent development of these human cultures is called history.", position: 0 },
      { title: "The Tree of Knowledge", content: "At present, we have no idea how consciousness and subjective experience emerged from raw neural data. The most common answer is that consciousness is a by-product of brain processes.\n\nBut this answer raises more questions than it answers. Why does the brain need to be conscious? Why do neural signals need to be accompanied by subjective experience?\n\nOne possibility is that subjective experience is the way the brain stores information. Another possibility is that consciousness is a fundamental feature of the universe, like mass or charge.\n\nWe may never know the answer. But we do know that the Cognitive Revolution gave Homo sapiens the ability to think about things that don't really exist, and to talk about them with others.", position: 1 },
      { title: "A Day in the Life of Adam and Eve", content: "The Agricultural Revolution began about 10,000 years ago in the river valleys of the Middle East. For the first time, humans began to cultivate plants and domesticate animals.\n\nThis revolution did not make life easier for the average person. Instead, it made life harder. Farmers worked longer hours than foragers, had less varied diets, and suffered more from infectious diseases.\n\nThe agricultural revolution was the point when humans began to reshape the natural world. Forests were cleared, rivers were dammed, and the landscape was transformed.\n\nBut the farmers didn't realize what they were doing. They thought they were improving their lives. In fact, they were setting in motion a process that would eventually transform the entire planet.", position: 2 },
      { title: "The Unification of Humankind", content: "Money is the most universal and most efficient system of mutual trust ever devised. It works because everybody believes in it.\n\nGold coins, silver coins, paper money, credit cards — they all have one thing in common. Their value exists only in our collective imagination. A dollar bill is just a piece of paper, but because we all agree it's worth something, it is.\n\nThis is the secret of money. It is not a physical reality but a psychological one. The entire economic system is built on shared fictions.\n\nThis is what makes Homo sapiens the most powerful creature on the planet. We can cooperate in large numbers because we can create and believe in shared stories.", position: 3 },
    ],
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "978-0-316-76948-0",
    category: "Fiction",
    description: "The story of Holden Caulfield, a teenager navigating the complexities of adolescence in New York City. A timeless exploration of alienation, identity, and the pain of growing up.",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
    coverTone: "from-rose-200 via-pink-100 to-fuchsia-100",
    bookAccess: "free",
    format: "eBook",
    pages: 234,
    quantity: 3,
    available: 3,
    shelfLocation: "Section A - Shelf 4",
    chapters: [
      { title: "The Beginning", content: "If you really want to hear about it, the first thing you'll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap.\n\nI don't feel like going into it, if you want to know the truth. In the first place, that stuff bores me, and in the second place, my parents would have about two hemorrhages apiece if I told anything pretty personal about them.\n\nI'm just going to tell you about this madman stuff that happened to me around last Christmas just before I got run down and had to come back here and take it easy.\n\nMy name is Holden Caulfield. I'm sixteen years old and I go to a school called Pencey Prep.", position: 0 },
      { title: "The Museum", content: "I was wondering where the ducks went during the winter. Every time I walked through the park I wondered about them.\n\nThe best thing in that museum was that everything always stayed right where it was. Nobody'd be moving around. You could go there a hundred thousand times and the Egyptian stuff would still be just as beautiful as it was.\n\nI felt so lonesome, all of a sudden. I almost wished I was dead.\n\nThe best thing, though, in that museum was that everything always stayed right where it was. Nobody'd move. Nobody'd be different. The only thing that would be different would be you.", position: 1 },
      { title: "Phoebe", content: "My sister Phoebe is ten years old. She's the smartest little kid I know. She reads all the time and she's got a wonderful sense of humor.\n\nWhen I went home, Phoebe was still awake. She was reading a book in bed. She looked up at me with those serious eyes of hers.\n\nAre you in trouble? she asked.\n\nNot exactly, I said.\n\nDaddy's going to kill you, she said.\n\nNo he won't, I said. He won't even know I was here.\n\nPhoebe just went back to her book. I went over and sat on the edge of her bed. She was reading the same book over and over again. It was about a little girl named Isak Dinesen.", position: 2 },
      { title: "The Catcher in the Rye", content: "I kept thinking about what Phoebe had said. She kept asking me what I was going to do with my life.\n\nDo you know what I told her? I told her I wanted to be the catcher in the rye. She thought I was crazy. But I was serious.\n\nI mean it's the thing I'd like to be. I mean I keep picturing all these little kids playing some game in this big field of rye. Thousands of little kids, and nobody around — nobody big, I mean — except me.\n\nAnd I'm standing on the edge of some crazy cliff. And I have to catch everybody if they start to go over the cliff. That's all I'd do all day. I'd just be the catcher in the rye.", position: 3 },
    ],
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "978-0-374-53355-7",
    category: "Psychology",
    description: "Nobel laureate Daniel Kahneman takes us on a ground-breaking tour of the mind, explaining the two systems that drive the way we think — fast, intuitive thinking and slow, deliberate reasoning.",
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80",
    coverTone: "from-indigo-200 via-blue-100 to-cyan-100",
    bookAccess: "paid",
    price: 12,
    format: "eBook",
    pages: 499,
    quantity: 3,
    available: 3,
    shelfLocation: "Section B - Shelf 2",
    chapters: [
      { title: "Two Systems", content: "System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control. System 2 allocates attention to the effortful mental activities that demand it, including complex computations.\n\nThe operations of System 2 are often associated with the subjective experience of agency, choice, and concentration. When all goes smoothly, which is not often, System 2 suggests thoughts and actions that are reasonable.\n\nBut System 2 is lazy. It doesn't like to work hard. It prefers to let System 1 do the thinking. This is usually fine, but it can lead to systematic errors.\n\nHere is an example. A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?\n\nThe intuitive answer is 10 cents. The correct answer is 5 cents. Most people get this wrong because System 1 is too lazy to do the math.", position: 0 },
      { title: "Heuristics and Biases", content: "When faced with a difficult question, we often answer an easier one instead, without noticing the substitution. This is called attribute substitution.\n\nConsider the question: How happy are you with your life these days? This is a difficult question. But the mind doesn't like difficult questions.\n\nInstead, System 1 substitutes an easier question: What is my mood right now? And it answers that instead. The answer to the easier question replaces the answer to the harder one.\n\nThis is the availability heuristic at work. We judge the frequency or probability of events by how easily examples come to mind. If you can think of many examples, you think the event is common. If you can't, you think it's rare.", position: 1 },
      { title: "Overconfidence", content: "The confidence that individuals have in their beliefs depends mostly on the quality of the story they can tell about what they see, even if they see little.\n\nWYSIATI — What You See Is All There Is. We construct the best possible story from the information available, and we don't worry about the information we don't have.\n\nThis is why experts are so often overconfident. They have a good story. The story feels right. And because it feels right, they don't bother to check whether it actually is right.\n\nOverconfidence is not just a cognitive bias. It is the engine of capitalism. Entrepreneurs believe in their ideas more than is justified by the evidence. If they didn't, they would never start businesses.", position: 2 },
      { title: "Thinking About the Future", content: "We are pattern-seeking storytelling animals, and we are quite adept at telling stories about patterns that don't exist. This is the problem with prediction.\n\nThe future is uncertain, but we are convinced that it is knowable. We believe that with enough information and analysis, we can predict what will happen next. This belief is largely an illusion.\n\nThe best way to predict the future is to understand the present. The best way to understand the present is to study the past. But even this doesn't give us certainty.\n\nWhat can we do? We can learn to recognize our biases. We can seek out dissenting opinions. We can use statistical thinking instead of storytelling. And we can accept that the future will always surprise us.", position: 3 },
    ],
  },
  {
    title: "Educated: A Memoir",
    author: "Tara Westover",
    isbn: "978-0-399-59050-4",
    category: "Biography",
    description: "The remarkable story of a girl who grew up in a survivalist family in Idaho and went on to earn a PhD from Cambridge University, despite never setting foot in a classroom until age seventeen.",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    coverTone: "from-lime-200 via-green-100 to-emerald-100",
    bookAccess: "free",
    format: "eBook",
    pages: 334,
    quantity: 3,
    available: 3,
    shelfLocation: "Section C - Shelf 2",
    chapters: [
      { title: "The Mountain", content: "I grew up on a mountain in Idaho, in a family that was preparing for the end of the world. My father was a survivalist who distrusted the government and the medical establishment. He believed that the day of reckoning was near.\n\nWe didn't go to school. We didn't go to the doctor. We didn't watch television. We worked in my father's junkyard, salvaging metal from old cars and stacking it in neat piles.\n\nThe mountain was our world. It was beautiful and terrifying. The winters were brutal, the summers scorching. But it was home, and I loved it.\n\nI didn't know that there was another way to live until I was seventeen years old.", position: 0 },
      { title: "The Decision", content: "I decided to go to college. It was the most terrifying decision of my life. I had never been to school. I didn't know what algebra was. I had never written an essay.\n\nBut something in me knew that there was more to the world than the mountain. I had seen glimpses of it in books — my brother Tyler had taught himself enough to get into college, and I wanted to follow.\n\nMy father thought I was making a terrible mistake. My mother was worried. But they let me go.\n\nI applied to Brigham Young University and was accepted. When I walked onto campus for the first time, I had never heard of the Holocaust. I didn't know what the European Union was.", position: 1 },
      { title: "Cambridge", content: "The gates of Trinity College, Cambridge, were the most beautiful things I had ever seen. Stone walls covered in ivy, towers reaching into the sky, manicured lawns stretching as far as the eye could see.\n\nI could not believe that I was there. A girl from Buck's Peak, who had never set foot in a classroom until she was seventeen, was now at one of the most prestigious universities in the world.\n\nThe work was hard. The other students had backgrounds I couldn't imagine — they had gone to the best schools, had the best tutors. I had to work twice as hard to keep up.\n\nBut I loved the work. I loved the ideas. I loved the feeling of my mind growing, expanding, reaching toward something I couldn't yet name.", position: 2 },
      { title: "The Transformation", content: "Education is not merely learning facts. It is learning to think differently, to see different possibilities, to recognize the power of your own mind.\n\nWhen I looked in the mirror, I saw the same girl I had always been. But I was different. I had been transformed, not by a single moment but by a thousand small moments, each one building on the last.\n\nThe most important thing I learned at Cambridge was that I had the right to think for myself. That my voice mattered. That the stories I had been told about who I was and what I could become were not the only stories.\n\nI am not the same person who left Buck's Peak. I am someone new. But I am also the same girl who climbed the mountain, who loved her family, who believed in the power of faith.", position: 3 },
    ],
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "978-0-06-231500-7",
    category: "Fiction",
    description: "A magical fable about following your dreams. Santiago, a young shepherd, embarks on a journey across the Egyptian desert in search of treasure, discovering the true wealth lies within.",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    coverTone: "from-yellow-200 via-amber-100 to-orange-100",
    bookAccess: "free",
    format: "eBook",
    pages: 197,
    quantity: 4,
    available: 4,
    shelfLocation: "Section A - Shelf 5",
    chapters: [
      { title: "The Shepherd's Dream", content: "The boy's name was Santiago. He had been asleep for two hours when a dream woke him. He sat up, and the old man sitting beside him smiled at him.\n\nI had the same dream last night, the old man said. The boy didn't understand. But the old man told him that dreams were the language of God.\n\nSantiago was a shepherd. He liked to wander the fields with his flock, dreaming about travel and adventure. He dreamed of going to Egypt, to the Pyramids.\n\nThe old man was a king, or so he claimed. He told Santiago that there was treasure waiting for him at the Pyramids. All he had to do was follow his Personal Legend.", position: 0 },
      { title: "The Desert", content: "The desert was vast and empty. Santiago sat atop a dune and watched the sunset. The sky turned from gold to crimson to deep purple, and the stars began to appear.\n\nHe had left Spain with nothing but his sheep and a dream. Now, in the middle of the desert, he wondered if he had made a terrible mistake. The journey was harder than he had imagined.\n\nBut then the desert spoke to him. It whispered in the wind, in the shifting sands, in the silence between heartbeats. And Santiago understood that the desert was teaching him patience.\n\nThe alchemist told him that the secret of life was to listen. To really listen. Not with the ears, but with the heart.", position: 1 },
      { title: "The Oasis", content: "The oasis was a green jewel in the middle of a sea of sand. Palm trees swayed in the breeze, and a clear spring bubbled up from the rocks.\n\nSantiago met Fatima there. She was beautiful, with dark eyes and a smile that could light up the darkest night. They fell in love immediately, the way people do in stories.\n\nBut Santiago knew he couldn't stay. His treasure was waiting at the Pyramids. Fatima understood. She told him to go, and she would wait for him.\n\nThe desert teaches you that love is not about possession. It is about freedom. If Fatima was truly his love, she would be there when he returned.", position: 2 },
      { title: "The Pyramids", content: "At last, Santiago stood before the great Pyramids of Egypt. They rose from the desert floor like frozen waves, enormous and ancient and beautiful.\n\nHe dug in the sand where he had dreamed the treasure was buried. His hands bled. His body ached. But he found nothing.\n\nThen two refugees attacked him and took his gold. As they beat him, one of them laughed and said that he had once had a dream about treasure buried in Spain, in an old church with a sycamore tree.\n\nSantiago laughed. The treasure had been waiting for him all along, back where he started. But he had needed the journey to find it.\n\nThe treasure was not gold or jewels. It was the journey itself. It was everything he had learned along the way.", position: 3 },
    ],
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "978-0-7352-1129-2",
    category: "Self-Help",
    description: "A revolutionary guide to breaking bad habits and building good ones. Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones.",
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80",
    coverTone: "from-brand-purple/30 to-primary/40",
    bookAccess: "paid",
    price: 10,
    format: "eBook",
    pages: 320,
    quantity: 3,
    available: 3,
    shelfLocation: "Section B - Shelf 3",
    chapters: [
      { title: "The Surprising Power of Atomic Habits", content: "Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them.\n\nGetting 1 percent better every day counts for a lot in the long run. If you get one percent better each day for one year, you'll end up thirty-seven times better by the time you're done.\n\nThis is the power of tiny habits. Small changes often appear to make no difference until you cross a critical threshold. The most powerful outcomes of any compound process are delayed.\n\nYou need to be patient. You need to trust the process. The results will come.", position: 0 },
      { title: "The Four Laws of Behavior Change", content: "The first law is to make it obvious. If you want to build a good habit, make the cue obvious. If you want to break a bad habit, make the cue invisible.\n\nThe second law is to make it attractive. If you want to build a good habit, make the craving attractive. If you want to break a bad habit, make the craving unattractive.\n\nThe third law is to make it easy. If you want to build a good habit, make the response easy. If you want to break a bad habit, make the response difficult.\n\nThe fourth law is to make it satisfying. If you want to build a good habit, make the reward satisfying. If you want to break a bad habit, make the reward unsatisfying.", position: 1 },
      { title: "Identity-Based Habits", content: "The ultimate form of intrinsic motivation is when a habit becomes part of your identity. It's one thing to say I'm the type of person who wants this. It's something very different to say I'm the type of person who is this.\n\nEvery action you take is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity.\n\nWhen you fall in love with the process rather than the product, you don't have to wait to give yourself permission to be happy. You can be satisfied anytime your system is running.\n\nThe goal isn't to read a book. The goal is to become a reader. The goal isn't to run a marathon. The goal is to become a runner.", position: 2 },
      { title: "Systems and Goals", content: "You do not rise to the level of your goals. You fall to the level of your systems. Winners and losers have the same goals.\n\nEvery Olympian wants to win a gold medal. Every job candidate wants to get the job. The goal has never been the thing that makes the difference. The system is what makes the difference.\n\nGoals are about the results you want to achieve. Systems are about the processes that lead to those results. If you want to predict where you'll end up in life, follow your current trajectory, not your current results.\n\nFall in love with the process, not the product. The process is what you have control over. The product is what happens when you trust the process.", position: 3 },
    ],
  },
];

async function main() {
  console.log("Seeding library books...");

  for (const book of BOOKS) {
    const { chapters, ...bookData } = book;

    const existing = await prisma.book.findFirst({ where: { title: book.title } });
    if (existing) {
      console.log(`  Book "${book.title}" already exists, skipping.`);
      continue;
    }

    const created = await prisma.book.create({
      data: bookData,
    });

    for (const chapter of chapters) {
      await prisma.bookChapter.create({
        data: {
          bookId: created.id,
          title: chapter.title,
          content: chapter.content,
          position: chapter.position,
        },
      });
    }

    console.log(`  Created "${book.title}" with ${chapters.length} chapters`);
  }

  const count = await prisma.book.count();
  console.log(`\nDone. Total books in library: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
