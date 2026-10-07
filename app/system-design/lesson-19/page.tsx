import type { Metadata } from "next";
import LessonPager from "@/components/LessonPager";
import CodeBlock from "@/components/sd/CodeBlock";
import { Flow, QA } from "@/components/sd/diagrams";
import LessonHeader from "@/components/sd/LessonHeader";
import Section from "@/components/sd/Section";
import SequenceDiagram from "@/components/sd/SequenceDiagram";
import InvertedIndex from "@/components/sd/widgets/InvertedIndex";
import { SD_LESSONS, SD_SERIES, sdLessonHref } from "@/lib/system-design";

const lesson = SD_LESSONS.find((l) => l.slug === "lesson-19")!;

export const metadata: Metadata = {
  title: `Lesson 19 — ${lesson.title}`,
  description: lesson.summary,
};

/** In-page index. Each entry links to a section heading below. */
const outline = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-core-idea", label: "The Core Idea" },
  { id: "how-it-works", label: "How It Works" },
  { id: "trade-offs", label: "Trade-offs" },
  { id: "in-the-real-world", label: "In the Real World" },
  { id: "interview-questions", label: "Interview Questions" },
  { id: "key-takeaways", label: "Key Takeaways" },
  { id: "further-reading", label: "Further Reading" },
];

const code1 = `SELECT * FROM products WHERE name LIKE '%running shoes%';`;

const code2 = `Photosynthesis ....... 45, 112, 214
Pollination .......... 88, 90
Protein .............. 12, 45, 301`;

const code3 = `Doc 1: "Red running shoes for men"
Doc 2: "Blue running jacket"
Doc 3: "Men's red leather shoes"`;

const code4 = `Doc 1: red, running→run, shoes→shoe, for, men
Doc 2: blue, running→run, jacket
Doc 3: men's→men, red, leather, shoes→shoe`;

export default function SdLessonOneNinePage() {
  return (
    <article>
      <LessonHeader lesson={lesson} outline={outline} />

      <div className="lesson">
        <Section id="the-problem" title="The Problem" kind="problem">
          <p>Your shopping app has a search box. The first version is one line of SQL:</p>
          <CodeBlock lang="sql" code={code1} />
          <p>
            It works with 1,000 products. With 5 million, each search takes seconds. The reason is that{" "}
            <code>LIKE '%...%'</code> (a pattern match with a wildcard at the start) cannot use a normal index. So the
            database reads every row. Users also complain about the results:
          </p>
          <ul>
            <li>"Running shoe" (singular) finds nothing.</li>
            <li>"Nike runing shoes" (a typo) finds nothing.</li>
            <li>The best match shows up on page 4.</li>
          </ul>
          <p>
            Real search needs a different data structure. It is called the <strong>inverted index</strong>. An inverted
            index is a lookup table that maps each word to the list of documents that contain that word. Real search
            usually runs in a separate system built around it.
          </p>
        </Section>

        <Section id="the-core-idea" title="The Core Idea" kind="idea">
          <p>
            Open any textbook and turn to the <strong>index at the back</strong>:
          </p>
          <CodeBlock code={code2} />
          <p>
            You do not read every page to find "photosynthesis". You look up the <strong>word</strong> and jump
            straight to the <strong>pages</strong> that contain it.
          </p>
          <p>
            A normal record says "document → words it contains". An <strong>inverted index</strong> flips that
            around: "word → documents that contain it". That is why it is called <em>inverted</em>.
          </p>
        </Section>

        <Section id="how-it-works" title="How It Works" kind="how">
          <h3 id="building-an-inverted-index-by-hand">Building an inverted index by hand</h3>
          <p>Three products:</p>
          <CodeBlock code={code3} />
          <p>
            <strong>Step 1: Analyse the text.</strong> Break it into words (called tokens), make them lowercase, and cut
            each word down to a simple form (for example, "running" becomes "run"):
          </p>
          <CodeBlock code={code4} />
          <p>
            <strong>Step 2: Build the index.</strong> A <em>term</em> is one cleaned-up word stored in the index. For each
            term, list the documents (and the positions) where it appears. That list is called a{" "}
            <strong>posting list</strong>:
          </p>
          <InvertedIndex caption="A live inverted index over five products. Type a query and watch it become term lookups, a posting-list intersection and a ranking." />
          <p>
            <strong>Step 3: Search.</strong> For the query "red shoes":
          </p>
          <ul>
            <li>
              Analyse it the same way: <code>red</code>, <code>shoe</code>.
            </li>
            <li>
              Look up each term: <code>red</code> → &#123;1, 3&#125;, <code>shoe</code> → &#123;1, 3&#125;.
            </li>
            <li>
              <strong>AND</strong> them together. This means you keep only the documents that are in both lists (an
              intersection): &#123;1, 3&#125;.
            </li>
            <li>Rank the results (explained below). Both documents match. Doc 1 might rank higher if it is more relevant.</li>
          </ul>
          <p>
            You do not scan every document. You only do a few quick lookups, even across <strong>millions</strong> of
            documents.
          </p>
          <h3 id="text-analysis-making-search-forgiving">Text analysis: making search forgiving</h3>
          <Flow
            caption="The analyser pipeline, applied identically to documents and to queries."
            nodes={[
              { title: <>Raw text</>, desc: <>“Men's Red-Leather Running Shoes”</> },
              { title: <>Tokenise</>, desc: <>men's · red · leather · running · shoes</> },
              { title: <>Lowercase + stop words</>, desc: <>drop “the”, “for”, “a”</> },
              { title: <>Stem</>, desc: <>running → run, shoes → shoe, men's → men</> },
              {
                title: <>Index terms</>,
                desc: <>men · red · leather · run · shoe (+ synonyms, n-grams for autocomplete)</>,
                tone: "good",
              },
            ]}
          />
          <p>
            The <strong>analyser</strong> is the part that turns raw text into index terms. Much of search quality comes
            from it. It must treat documents (when you index them) and queries (when you search) in the same way.
            These are its steps:
          </p>
          <ul>
            <li>
              <strong>Tokenisation:</strong> split text into words. "Men's red-leather shoes" → <code>men's</code>,{" "}
              <code>red</code>, <code>leather</code>, <code>shoes</code>.
            </li>
            <li>
              <strong>Lowercasing:</strong> <code>Shoes</code> = <code>shoes</code>.
            </li>
            <li>
              <strong>Stop words:</strong> you can choose to drop very common words ("the", "for", "a"). They say little
              about the topic.
            </li>
            <li>
              <strong>Stemming or lemmatisation:</strong> cut a word down to its root. <em>Stemming</em> chops off word
              endings with simple rules (<code>running</code>, <code>runs</code> → <code>run</code>;{" "}
              <code>shoes</code> → <code>shoe</code>). <em>Lemmatisation</em> uses a dictionary, so it can also turn{" "}
              <code>ran</code> into <code>run</code>. Now "running shoe" matches "run shoes".
            </li>
            <li>
              <strong>Synonyms:</strong> words with the same meaning are treated as equal:{" "}
              <code>sneakers</code> ↔ <code>trainers</code> ↔ <code>running shoes</code>, and <code>TV</code> ↔{" "}
              <code>television</code>.
            </li>
            <li>
              <strong>N-grams / edge n-grams:</strong> an n-gram is a short piece of a word. Edge n-grams are pieces from
              the start of the word (<code>sho</code>, <code>shoe</code>, <code>shoes</code>). You index these pieces
              for <strong>autocomplete</strong> (suggestions while the user types) and partial matches.
            </li>
            <li>
              <strong>Fuzzy matching:</strong> match words that are only a few edits apart. An edit is adding, removing or
              changing one letter. So <code>runing</code> still finds <code>running</code>. This handles typos.
            </li>
            <li>
              <strong>Language-specific rules</strong> for Hindi, Japanese, German compound words (long words made from
              several words) and so on.
            </li>
          </ul>
          <h3 id="ranking-which-results-come-first">Ranking: which results come first?</h3>
          <p>
            Finding matches is half the job. Putting them in a good <strong>order</strong> (ranking) is the other half.
            Ranking gives each match a score. The best scores come first.
          </p>
          <p>
            <strong>TF-IDF</strong> is a classic scoring formula. It multiplies two ideas:
          </p>
          <ul>
            <li>
              <strong>TF (term frequency):</strong> how often the word appears in one document. A document that mentions
              "shoes" many times is probably more about shoes.
            </li>
            <li>
              <strong>IDF (inverse document frequency):</strong> how rare the word is across all documents. Rare words
              matter more. Matching "leather" (in few documents) says more than matching "for" (in almost all).
            </li>
          </ul>
          <p>
            <strong>BM25</strong> is a ranking formula that improves on TF-IDF. It is the default in Elasticsearch,
            OpenSearch and Lucene. It stops giving too much credit for repeated words. It also adjusts for document
            length. So a short title that matches well beats a long page that mentions the word once.
          </p>
          <p>
            Real products then add <strong>business signals</strong> (facts about your business that change the order):
          </p>
          <ul>
            <li>popularity, ratings and sales,</li>
            <li>recency (for news),</li>
            <li>user location or personalisation,</li>
            <li>
              <strong>boosting</strong> fields (boosting means giving one field more weight: a match in the{" "}
              <em>title</em> counts more than a match in the <em>description</em>),
            </li>
            <li>and, more and more, machine-learning ranking models (models that learn the best order from past clicks).</li>
          </ul>
          <h3 id="filters-and-facets">Filters and facets</h3>
          <p>
            Search pages usually combine <strong>text search</strong> with <strong>structured filters</strong>: "red
            shoes" + size 9 + price under ₹3,000 + brand = Nike. A <strong>facet</strong> is a count of results for
            each value of a field. For example, "Nike (120), Adidas (95), Puma (40)" in the sidebar. Search engines
            compute facets for you. They store these structured fields in formats that are fast for filtering and
            counting.
          </p>
          <h3 id="search-at-scale-distributed-search">Search at scale: distributed search</h3>
          <p>
            One machine cannot hold the index for billions of documents. It also cannot answer thousands of queries per
            second. So search engines split the index into parts:
          </p>
          <SequenceDiagram
            caption="Scatter-gather across shards. The response waits for the slowest shard — tail latency again."
            actors={["Client", "Coordinator", "Shard 1", "Shard 2", "Shard 3"]}
            messages={[
              { from: 0, to: 1, label: <>search “red shoes”, top 10</> },
              { from: 1, to: 2, label: <>query</> },
              { from: 1, to: 3, label: <>query</> },
              { from: 1, to: 4, label: <>query</> },
              { from: 2, to: 1, label: <>local top 10</>, reply: true },
              { from: 4, to: 1, label: <>local top 10</>, reply: true },
              { from: 3, to: 1, label: <>local top 10</>, note: <>the slow one</>, reply: true },
              { from: 1, to: 1, label: <>merge by score</> },
              { from: 1, to: 0, label: <>global top 10</>, reply: true },
            ]}
          />
          <ul>
            <li>
              <strong>Shards:</strong> a shard is one slice of the data. Each shard holds part of the documents and their
              index.
            </li>
            <li>
              <strong>Replicas:</strong> copies of each shard. They keep search working if a machine fails (availability).
              They also let more queries run at the same time.
            </li>
            <li>
              <strong>Scatter-gather:</strong> a coordinator (the node that receives the query) sends the query to all
              shards. Each shard returns its best results. The coordinator merges them into a final top 10.
            </li>
          </ul>
          <p>
            This connects to Lesson 8 on latency. A search that fans out to many shards is exposed to{" "}
            <strong>tail latency</strong> (the rare slow responses). The slowest shard decides the response time.
          </p>
          <p>
            <strong>Near-real-time:</strong> new documents do not become searchable at once. They become searchable after
            a short <strong>refresh interval</strong>. In Elasticsearch the default is 1 second.
          </p>
          <h3 id="keeping-search-in-sync-with-your-database">Keeping search in sync with your database</h3>
          <p>
            The search index is usually a <strong>copy</strong> of your data. The "source of truth" (the place where the
            correct data lives) is your main database. How do you keep the two in sync?
          </p>
          <p>
            <strong>1. Dual writes.</strong> The app writes to the database <em>and</em> to the search engine.
          </p>
          <ul>
            <li>It is simple. But if one write fails, the two systems disagree. This is easy to get wrong without noticing.</li>
          </ul>
          <p>
            <strong>2. Queue or events (recommended).</strong> The app writes to the database and sends an event (a
            short message such as "product 991 updated") to a queue. A worker reads the event and updates the search
            index.
          </p>
          <p>
            <strong>3. Change Data Capture (CDC).</strong> CDC is a method that reads the database's change log (the
            file where the database records every change) and sends each change to the indexer. This happens
            automatically, so no app code can forget to do it.
          </p>
          <Flow
            caption="Keep the index as a derived copy, fed from the database's change log."
            dir="row"
            nodes={[
              { title: <>App</> },
              { title: <>Database</>, desc: <>source of truth</> },
              { title: <>CDC</>, desc: <>reads the change log</> },
              { title: <>Queue</> },
              { title: <>Indexer</> },
              { title: <>Search cluster</>, desc: <>rebuildable</>, tone: "good" },
            ]}
          />
          <p>
            An important rule: <strong>treat the search index as derived, rebuildable data.</strong> If it gets
            damaged, or you change the analyser, you can <strong>re-index</strong> (build the index again) from the
            database. Never make the search engine the only place where important data lives.
          </p>
          <h3 id="beyond-keywords-semantic-vector-search">Beyond keywords: semantic (vector) search</h3>
          <p>
            Keyword search matches <strong>words</strong>. But "cheap flights to Goa" and "budget air tickets to Goa"
            mean the same thing in different words. A keyword search may miss that.
          </p>
          <p>
            <strong>Vector search</strong> finds results by meaning. A machine-learning model turns text (or images) into
            a list of numbers called an <strong>embedding</strong>. Similar <strong>meanings</strong> get lists that
            are close to each other. The search engine then finds the "nearest" lists. It uses{" "}
            <strong>approximate nearest neighbour (ANN)</strong> algorithms. These find close neighbours quickly, but
            not always the exact closest ones.
          </p>
          <p>
            Many systems now use <strong>hybrid search</strong>. It combines keyword results (BM25) with vector
            results and then ranks them again. Many AI assistants also use search to find relevant documents before
            they answer a question. This is called retrieval-augmented generation, or RAG.
          </p>
          <h3 id="popular-tools">Popular tools</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Apache Lucene</strong>
                  </td>
                  <td>The core search library behind Elasticsearch, OpenSearch and Solr</td>
                </tr>
                <tr>
                  <td>
                    <strong>Elasticsearch / OpenSearch</strong>
                  </td>
                  <td>Distributed search and analytics engines built on Lucene. OpenSearch is a fork of Elasticsearch. Very widely used</td>
                </tr>
                <tr>
                  <td>
                    <strong>Apache Solr</strong>
                  </td>
                  <td>Mature Lucene-based search server</td>
                </tr>
                <tr>
                  <td>
                    <strong>PostgreSQL full-text search</strong>
                  </td>
                  <td>Built into Postgres. Great for small or medium needs without a separate system</td>
                </tr>
                <tr>
                  <td>
                    <strong>Meilisearch, Typesense</strong>
                  </td>
                  <td>Simpler engines focused on fast, typo-tolerant app search</td>
                </tr>
                <tr>
                  <td>
                    <strong>Vector databases / extensions</strong>
                  </td>
                  <td>pgvector, and vector features in Elasticsearch/OpenSearch, among others</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="trade-offs" title="Trade-offs" kind="tradeoffs">
          <ul>
            <li>
              ✅ Fast full-text search over huge data, plus relevance ranking, typo tolerance, synonyms and facets.
            </li>
            <li>
              ❌ <strong>Another system to run.</strong> Search clusters need memory, tuning, monitoring and upgrades.
            </li>
            <li>
              ❌ <strong>Eventually consistent.</strong> New or updated items appear in search after a short delay, not at
              once.
            </li>
            <li>
              ❌ <strong>Sync complexity.</strong> Keeping the index in step with the database needs care (events, CDC,
              re-indexing).
            </li>
            <li>
              ❌ <strong>Relevance tuning is endless.</strong> Analysers, synonyms and boosts need ongoing work and
              testing.
            </li>
          </ul>
          <p>
            <strong>When not to add a search engine:</strong> small datasets, or simple needs like "search my 500 notes"
            or "filter products by category". <strong>PostgreSQL full-text search</strong> or even a well-indexed{" "}
            <code>WHERE</code> clause is often enough. Add Elasticsearch or OpenSearch when you need scale, relevance
            tuning, typo tolerance or rich facets.
          </p>
        </Section>

        <Section id="in-the-real-world" title="In the Real World" kind="real">
          <p>
            <strong>Wikipedia</strong> uses Elasticsearch for its on-site search across hundreds of languages. It uses
            analysers made for each language, so that search works well in each one.
          </p>
          <p>
            <strong>GitHub code search.</strong> GitHub built its own search engine for code (written in Rust). General-purpose
            search engines did not handle code well: symbols, exact substrings and a huge number of
            files. It shows that the <strong>type of content</strong> changes how you should design the index.
          </p>
          <p>
            <strong>E-commerce search.</strong> Large online stores combine keyword search with filters (size, brand,
            price), facets, typo correction ("iphnoe" → "iphone") and ranking by popularity and sales. Search quality
            directly affects revenue: if users can't find it, they can't buy it.
          </p>
          <p>
            <strong>Log search.</strong> Tools like the ELK stack (Elasticsearch, Logstash, Kibana) or OpenSearch are
            used by many companies to search through application logs. It is the same inverted-index idea, used
            on billions of log lines (more in Part 8, Observability).
          </p>
          <p>
            <strong>AI assistants and "chat with your documents".</strong> Many products that let you ask questions
            about your own files use vector or hybrid search to find the most relevant passages first. Then they give those passages to
            a language model.
          </p>
        </Section>

        <Section id="interview-questions" title="Interview Questions" kind="interview">
          <QA
            items={[
              {
                q: <>Why is LIKE '%term%' slow, and what does a search engine do instead?</>,
                a: (
                  <>
                    <p>
                      A wildcard at the start of the pattern cannot use a B-tree index (the normal database index, which
                      is sorted), so the database scans every row. A search engine builds an inverted index. It maps
                      each analysed term to the documents that contain it. So a query becomes a few posting-list
                      lookups and intersections. The work stays small even when the collection is very large.
                    </p>
                  </>
                ),
              },
              {
                q: <>What is text analysis, and why must it match at index and query time?</>,
                a: (
                  <>
                    <p>
                      Text analysis turns raw text into index terms. It splits text into tokens, lowercases them, removes
                      stop words, stems them, and adds synonyms and n-grams. The query must go through the same steps.
                      If it does not, “Running” never finds the stored term “run”.
                    </p>
                  </>
                ),
              },
              {
                q: <>How does BM25 rank documents?</>,
                a: (
                  <>
                    <p>
                      It gives each match a score. The score uses three things. First, term frequency, with smaller extra
                      credit for each repeat. Second, inverse document frequency, so rare terms count more. Third,
                      document length, so short and focused fields win. Products then add business signals on top:
                      popularity, recency and field boosts.
                    </p>
                  </>
                ),
              },
              {
                q: <>How do you keep a search index in sync with the database?</>,
                a: (
                  <>
                    <p>
                      Treat the index as derived data. Send change events, or use CDC from the database log, to an
                      indexer. Do not use dual writes, because the two systems can drift apart without anyone
                      noticing. Always keep the ability to rebuild the whole index from the source of truth.
                    </p>
                  </>
                ),
              },
              {
                q: <>When is PostgreSQL full-text search enough?</>,
                a: (
                  <>
                    <p>
                      It is enough when data and query volume are modest, relevance needs are simple and you need no heavy
                      facets. For example, searching an app's own notes or tickets. It saves you from running and
                      syncing a second system. Move to Elasticsearch or OpenSearch when you need scale, typo
                      tolerance, facets and relevance tuning.
                    </p>
                  </>
                ),
              },
              {
                q: <>Keyword search vs vector search?</>,
                a: (
                  <>
                    <p>
                      Keyword search matches words exactly (after analysis). It is precise, and you can explain why a
                      result matched. Vector search matches meaning by using embeddings and nearest-neighbour search.
                      So “budget air tickets” finds “cheap flights”. Hybrid search combines both and ranks again.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </Section>

        <Section id="key-takeaways" title="Key Takeaways" kind="takeaways">
          <ul>
            <li>
              An <strong>inverted index</strong> maps <strong>term → documents</strong>, like the index at the back of a
              book, so search avoids scanning every document.
            </li>
            <li>
              <strong>Text analysis</strong> (tokenising, lowercasing, stemming, synonyms, n-grams, fuzzy matching)
              makes search forgiving. <strong>BM25</strong> plus business signals decides ranking.
            </li>
            <li>
              Big search systems <strong>shard and replicate</strong> the index and use <strong>scatter-gather</strong>{" "}
              queries, so tail latency matters.
            </li>
            <li>
              Keep search <strong>in sync</strong> with the database using <strong>events or CDC</strong>, and treat the
              index as <strong>rebuildable, derived data</strong>.
            </li>
            <li>
              Start simple (PostgreSQL full-text search). Move to Elasticsearch or OpenSearch when you need scale and
              relevance features. Consider <strong>vector/hybrid search</strong> for meaning-based queries.
            </li>
          </ul>
        </Section>

        <Section id="further-reading" title="Further Reading" kind="reading">
          <ul>
            <li>
              <em>Introduction to Information Retrieval</em> by Manning, Raghavan and Schütze (free online from
              Stanford)
            </li>
            <li>The Elasticsearch reference documentation (the sections on text analysis and relevance)</li>
            <li>The PostgreSQL documentation chapter "Full Text Search"</li>
            <li>
              <em>System Design Interview</em> by Alex Xu (chapter "Design A Search Autocomplete System")
            </li>
            <li>GitHub's engineering blog posts about building its code search engine</li>
          </ul>
          <p>
            <em>
              This ends Part 3. Next is Part 4: Databases &amp; Data at Scale, starting with "SQL vs NoSQL: Picking
              the Right Data Model".
            </em>
          </p>
        </Section>
      </div>

      <LessonPager slug={lesson.slug} lessons={SD_LESSONS} href={sdLessonHref} series={SD_SERIES} />
    </article>
  );
}
