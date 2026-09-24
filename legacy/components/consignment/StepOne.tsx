import { useState, useRef, useEffect } from "react";
import styles from "../../styles/Consignment.module.css";
import BrandAutocomplete from "@/components/consignment/BrandAutocomplete";

type StepOneProps = {
  onAddItem: (type: string, brand: string, value: string) => void;
};

// Brand list for autocomplete (moved from parent component)
const brandList: string[] = [
    "A. Link", "A.JAFFE", "Aaron Basha", "Adamas", "Alessandro Fanfani", "Alex Sepkus", "Alex Woo", "Alexander McQueen",
    "Alexandra Mor", "Alexis Bittar", "Alfieri & St.John", "Alpina", "Ambrosi", "Amoro", "Amrapali", "Amuletto",
    "Andrea Candela", "Angela Cummings", "Anil Arjandas", "Anne Klein", "Antonini", "Anzie", "Arman Sarkisyan", "Armani",
    "Armani Exchange", "Armenta", "Arnold & Son", "Asch Grossbardt", "Asprey", "Audemars Piguet", "Baccarat", "Balenciaga",
    "Ball", "Barry Kronen", "Baume & Mercier", "Bedat & Co.", "Bell & Ross", "Benchmark", "Benrus", "Bertolucci",
    "Bibigi", "Blancpain", "Blue Nile", "Bottega Veneta", "Boucheron", "Bovet", "Breguet", "Breil", "Breitling",
    "Bremont", "Brenzikofer", "Brera Orologi", "Buccellati", "Bucherer", "Bucheron", "Bueche Girod", "Bulgari", "Bulova",
    "Burberry", "CT Scuderia", "Calgaro", "Calvin Klein", "Carelle", "Carrera y Carrera", "Cartier", "Casato", "Casio",
    "Cathy Waterman", "Chan Luu", "Chanel", "Charles Krypell", "Charriol", "Chaumet", "Chimento", "Chloé", "Chopard",
    "Christian Dior", "Christian Van Sant", "Chrome Hearts", "Chronoswiss", "Citizen", "Claude Meylan", "Coach",
    "Concord", "Corum", "Crivelli", "Cuervo y Sobrinos", "Céline", "DKNY", "Damiani", "Dana Rebecca", "Daniel K",
    "Daniel Roth", "David Gross", "David Morris", "David Webb", "David Yurman", "Davide Currado", "De Beers",
    "Deakin & Francis", "Di Modolo", "Diesel", "Dolce & Gabbana", "Dominique Cohen", "Doris Panos",
    "Dubey & Schaldenbrand", "Dunhill", "Ebel", "Eberhard", "Ed Hardy", "Effy", "Elizabeth Locke", "Elizabeth Rand",
    "Enicar", "Ernest Borel", "Ernst Benz", "Eterna", "Eva Fehren", "F.P. Journe", "Fabergé", "Faraone Mennella",
    "Favero", "Feludei", "Fendi", "Fendi Timepieces", "Feri", "Fern Freeman", "Ferrari", "Fiona Paxton", "Fortis",
    "Fossil", "Franck Muller", "Fred Leighton", "Fred of Paris", "Frederic Sage", "Gabriel & Co.", "Garrard", "Gavello",
    "Georg Jensen", "Georland", "Giorgio Visconti", "Girard-Perregaux", "Givenchy", "Glashutte", "Goshwara", "Graff",
    "Graham", "Gregg Ruth", "Gucci", "Guess", "Gumuchian", "Gurhan", "H. Stern", "HYT", "Hamilton", "Hammerman",
    "Harry Winston", "Hearts on Fire", "Helbros", "Henri Bendel", "Henri Daussi", "Henry Dunay", "Heritage Gem Studio",
    "Hermès", "Hidalgo", "House of Baguettes", "Hublot", "Hugo Boss", "IWC", "Ippolita", "Irene Neuwirth", "Iridesse",
    "Ivanka Trump", "Jacob & Co.", "Jaeger-LeCoultre", "Jean Paul Gaultier", "Jemma Wynne", "Jewelili", "Jivago",
    "John Galliano", "John Hardy", "Jorg Gray", "Jose Hess", "Jovial", "Jude Frances", "Judith Leiber", "Judith Ripka",
    "Just Cavalli", "Juvenia", "K. Brunini", "Kabana", "Kate Spade", "Katy Briscoe", "Kendra Scott", "Kenneth Cole",
    "Kenneth Jay Lane", "Kieselstein-Cord", "Kobelli", "Koesia", "Konstantino", "Kurt Wayne", "Kwiat", "LALI Jewels",
    "Lacoste", "Lagos", "Lalla & Rossana", "Lani Fratelli", "Lanvin", "Laura Munder", "Lauren K", "Le Vian", "Leibish",
    "Leo Pizzo", "Leslie Greene", "Linde Werdelin", "Loewe", "Longines", "Loree Rodkin", "Loren Jewels", "Louis Vuitton",
    "Luca Carati", "MIIORI", "MIMÍ", "Maggioro", "Manufacture Royale", "Marc By Marc Jacobs", "Marc Jacobs",
    "Marco Bicego", "Maria Tash", "Marina B", "Masi Gioielli", "Massocchi", "Mathey Tissot", "Mattioli Jewelry",
    "Mauboussin", "Maurice Lacroix", "Me&Ro", "Meira T", "Melissa Joy Manning", "Messika", "Michael B.",
    "Michael Beaudry", "Michael Kors", "Michele", "Mido", "Miki", "Mikimoto", "Mimi So", "Misahara", "Misani Hirom",
    "Miu Miu", "Monica Rich Kosann", "Montblanc", "Montres De Luxe Milano", "Moubussin", "Movado", "Mulco", "Nanis",
    "Natalie K", "Neil Lane", "Nili", "Nina Ricci", "Nixon", "Nouvelle Bague", "Oceanaut", "Odelia",
    "Officina Bernardi", "Olivia Burton", "Omega", "Oris", "Oro Trend", "Oromalia", "Orovoque", "Oscar De La Renta",
    "Oscar Heyman", "Otto Grun", "Pade Vavra", "Palmiero", "Panerai", "Parmigiani Fleurier", "Pasquale Bruni",
    "Patek Philippe", "Paul Morelli", "Penny Preville", "Penta", "Perrelet", "Philip Stein", "Phillips House", "Piaget",
    "Pianegonda", "Piccio Giancario", "Piero Milano", "Pierre Cardin", "Pierre Kunz", "Pierre Laurent", "Poiray",
    "Pomellato", "Porsche Design", "Prada", "Preziosismi", "RITANI", "RJ Graziano", "Rado", "Raima", "Raymond Lee",
    "Raymond Weil", "Repossi", "Richard Mille", "Rina Limor", "Robert Lee Morris", "Roberta Porrati", "Roberto Bianci",
    "Roberto Coin", "Roberto DeMeglio", "Roberto Portillo", "Roberto Zavanone", "Robin Rotenier", "Roger Dubuis", "Rolex",
    "Royal Asscher", "Rue Du Rhone", "Sabbadini", "Saint Honore", "Saint Laurent", "Salavetti", "Salvatore Ferragamo",
    "Salvini", "Saplin", "Sartoro", "Scott Kay", "Seapro", "Sector", "Seiko", "Shawn Warren", "Shinola", "Simon G.",
    "Skagen", "Slane & Slane", "Solange Azagury-Partridge", "Sonia B. Designs", "Staurino Fratelli", "Stefan Hafner",
    "Stephen Dweck", "Stephen Webster", "Strumento Marino", "Suarez", "Superoro", "Swarovski", "Swatch", "Swiss Army",
    "Sydney Evan", "Sylvie", "Tacori", "Tag Heuer", "TechnoMarine", "Ted Baker", "Ted Lapidus", "Temple St. Clair",
    "Teslar", "The Expression", "Theo Fennell", "Tiffany & Co.", "Tissot", "Tockr", "Todd Reed", "Tom Ford",
    "Tommy Hilfiger", "Tourneau", "Tous", "Tudor", "Tutima", "U-Boat", "Ulysse Nardin", "Universal Geneve", "Utopia",
    "Vacheron Constantin", "Valente Milano", "Valentino", "Van Cleef & Arpels", "Vasari", "Vecchio", "Vera Wang",
    "Verragio", "Versace", "Vhernier", "Victoria Casal", "Waltham", "Wenger", "Wintour", "Wittnauer", "Y. Akdin",
    "Yossi Harari Jewelry", "Yves Saint Laurent", "ZYDO", "Zancan", "Zenith", "Zoccai", "de Grisogono", "evaNueva", "Other"
  ];

const StepOne: React.FC<StepOneProps> = ({ onAddItem }) => {
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [value, setValue] = useState("");
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBrand(value);
    if (value.length > 0) {
      const suggestions = brandList.filter(brand =>
        brand.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredBrands(suggestions);
      setShowSuggestions(true);
    } else {
      setFilteredBrands([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (brand: string) => {
    setBrand(brand);
    setFilteredBrands([]);
    setShowSuggestions(false);
  };

  const handleAddItem = () => {
    onAddItem(type, brand, value);
    setType("");
    setBrand("");
    setValue("");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>CONSIGNMENT STEP 1 OF 2</h2>
      <p className={styles.subheading}>
        Tell us about the piece(s) you are shipping in.
      </p>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Item Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select Item</option>
            <option value="Watch">Watch</option>
      
            <option value="Jewelry">Jewelry</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Brand (If known)</label>
          <BrandAutocomplete 
            wrapperRef={wrapperRef}
            value={brand}
            handleChange={handleChange}
            showSuggestions={showSuggestions}
            filteredBrands={filteredBrands}
            handleSuggestionClick={handleSuggestionClick}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>
            Approximate Value
            <br />
            <small>(so we can securely insure your shipment)</small>
          </label>
          
            <input
            placeholder="$0.00"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
            />
          
        </div>
      </div>

      <button type="button" className={styles.nextBtn} onClick={handleAddItem}>
        ADD ITEM
      </button>
    </div>
  );
};

export default StepOne;