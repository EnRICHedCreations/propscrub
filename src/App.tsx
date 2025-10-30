import { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { LoadingScreen } from './components/LoadingScreen';
import { FilterSettings } from './components/FilterSettings';
import { FilterSettingsSection } from './components/FilterSettingsSection';
import { DataTable } from './components/DataTable';
import { ExportButton } from './components/ExportButton';
import { ExportToGHLButton } from './components/ExportToGHLButton';
import { HeaderMappingModal } from './components/HeaderMappingModal';
import { MarketSearchModal } from './components/MarketSearchModal';
import { ExportColumnsModal } from './components/ExportColumnsModal';
import { BalanceDisplay } from './components/BalanceDisplay';
import { PurchaseModal } from './components/PurchaseModal';
import { VersionToggle, ScrubVersion } from './components/VersionToggle';
import { CleanedRow, PhoneCache, RawRow } from './types';
import { UserBalance, PurchaseOption, canAffordScrub, deductScrubCost, calculateScrubCost } from './types/currency';
import { parseCSV } from './utils/csvParser';
import { normalizeRowWithCustomMapping } from './utils/headerMapping';
import { validatePhone } from './utils/phoneValidation';
import { validateEmail } from './utils/emailValidation';
import { applyDataFilters } from './utils/dataFiltering';
import { exportToCSV } from './utils/csvExport';
import assignsLogo from './images/Assigns-Logo.png';
import './App.css';

function App() {
  const [rawData, setRawData] = useState<RawRow[]>([]);
  const [cleanedData, setCleanedData] = useState<CleanedRow[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showMarketSearchModal, setShowMarketSearchModal] = useState(false);
  const [showExportColumnsModal, setShowExportColumnsModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [scrubVersion, setScrubVersion] = useState<ScrubVersion>('basic');
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    removeDuplicates: true,
    removeMissingPhone: true,
    removeInvalidEmail: true,
    removeInvalidPhone: true,
    numberOfPhones: 1,
    numberOfEmails: 1,
    marketSearch: ''
  });
  const [userBalance, setUserBalance] = useState<UserBalance>({
    bubbles: 100 // Start with 100 bubbles for testing
  });
  const [isExportingToGHL, setIsExportingToGHL] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setError('');
      setProgress(0);
      setCleanedData([]);

      // Parse CSV
      const parsedData = await parseCSV(file);
      if (parsedData.length === 0) {
        setError('CSV file is empty');
        return;
      }

      // Store raw data
      setRawData(parsedData);

      // Get detected headers
      const headers = Object.keys(parsedData[0]);
      setDetectedHeaders(headers);

      // Show market search modal after file import
      setShowMarketSearchModal(true);
    } catch (err) {
      setError(`Error processing file: ${err}`);
      console.error(err);
    }
  };

  const handleClearFile = () => {
    setRawData([]);
    setCleanedData([]);
    setDetectedHeaders([]);
    setShowMarketSearchModal(false);
    setShowExportColumnsModal(false);
    setShowMappingModal(false);
    setError('');
    setProgress(0);
  };

  const handleMarketSearchContinue = (marketSearch: string) => {
    setFilterSettings({
      ...filterSettings,
      marketSearch
    });
    setShowMarketSearchModal(false);
    setShowExportColumnsModal(true);
  };

  const handleMarketSearchCancel = () => {
    setShowMarketSearchModal(false);
    // Reset file loading state
    setRawData([]);
    setDetectedHeaders([]);
  };

  const handleExportColumnsMapCSV = (numberOfPhones: number, numberOfEmails: number) => {
    setFilterSettings({
      ...filterSettings,
      numberOfPhones,
      numberOfEmails
    });
    setShowExportColumnsModal(false);
    setShowMappingModal(true);
  };

  const handleExportColumnsCancel = () => {
    setShowExportColumnsModal(false);
    setShowMarketSearchModal(true);
  };

  const handleMappingConfirm = async (customMapping: Record<string, string | string[]>) => {
    const isPrisonScrub = scrubVersion === 'prison';
    const recordCount = rawData.length;
    const cost = calculateScrubCost(recordCount, isPrisonScrub);

    // Check if user has enough balance
    if (!canAffordScrub(userBalance, recordCount, isPrisonScrub)) {
      setError(`Insufficient balance! You need ${cost} Bubbles to scrub ${recordCount} records with ${isPrisonScrub ? 'Prison Scrub' : 'Basic Scrub'}. Click the "Add" button in the header to purchase more.`);
      setShowMappingModal(false);
      setShowPurchaseModal(true);
      return;
    }

    setShowMappingModal(false);

    try {
      // Generate target headers based on filter settings
      const targetHeaders: string[] = ["First Name", "Last Name"];

      // Add phone columns
      for (let i = 1; i <= filterSettings.numberOfPhones; i++) {
        targetHeaders.push(filterSettings.numberOfPhones === 1 ? "Phone" : `Phone ${i}`);
      }

      // Add email columns
      for (let i = 1; i <= filterSettings.numberOfEmails; i++) {
        targetHeaders.push(filterSettings.numberOfEmails === 1 ? "Email" : `Email ${i}`);
      }

      // Add remaining fields
      targetHeaders.push("Property Address", "Contact Type", "Opportunity Name", "Stage", "Pipeline", "Tags");

      // Normalize using custom mapping with dynamic headers
      const normalizedData = rawData.map(row =>
        normalizeRowWithCustomMapping(row, customMapping, targetHeaders)
      );
      setCleanedData(normalizedData);

      // Deduct cost from balance
      setUserBalance(deductScrubCost(userBalance, recordCount, isPrisonScrub));

      // Start phone and email validation
      await validateAllPhones(normalizedData, filterSettings.numberOfPhones, filterSettings.numberOfEmails, isPrisonScrub);
    } catch (err) {
      setError(`Error processing data: ${err}`);
      console.error(err);
    }
  };

  const handlePurchase = (option: PurchaseOption) => {
    // In development mode, simulate successful purchase
    console.log('DEV MODE: Simulating purchase of', option.name);

    const newBalance = {
      bubbles: userBalance.bubbles + option.bubbles
    };

    setUserBalance(newBalance);
    setShowPurchaseModal(false);

    // Show success message
    alert(`✅ Purchase Successful! (DEV MODE)\n\nYou received: ${option.bubbles} Bubbles 💧`);
  };

  const handleMappingCancel = () => {
    setShowMappingModal(false);
    setShowExportColumnsModal(true);
  };

  const validateAllPhones = async (rows: CleanedRow[], numberOfPhones: number, numberOfEmails: number, isPrisonScrub: boolean) => {
    setIsValidating(true);
    setProgress(0);

    // Small delay to ensure loading screen renders
    await new Promise(resolve => setTimeout(resolve, 100));

    // For Basic Scrub, calculate delay to ensure 6 second minimum loading time
    const targetLoadingTime = 6000; // 6 seconds in milliseconds
    const totalRows = rows.length;

    // Calculate how many progress updates to make (max 100, or number of rows if less)
    const progressSteps = Math.min(100, totalRows);
    const rowsPerStep = Math.ceil(totalRows / progressSteps);
    const delayPerStep = !isPrisonScrub ? targetLoadingTime / progressSteps : 0;

    const cache: PhoneCache = {};
    const seenAddresses = new Set<string>();
    const updatedRows = [...rows];

    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];

      // Check for duplicate addresses
      const propertyAddress = String(row["Property Address"] || "").trim().toLowerCase();
      if (propertyAddress && seenAddresses.has(propertyAddress)) {
        row["Duplicate Phone"] = true; // Reusing this flag for duplicate addresses
      } else if (propertyAddress) {
        seenAddresses.add(propertyAddress);
        row["Duplicate Phone"] = false;
      }

      // Validate all phone fields
      let hasAnyPhone = false;
      let anyPhoneValid = false;

      for (let p = 1; p <= numberOfPhones; p++) {
        const phoneField = numberOfPhones === 1 ? "Phone" : `Phone ${p}`;
        const phone = (row[phoneField] as string)?.trim() || '';

        if (phone) {
          hasAnyPhone = true;

          // Only validate phone via API if Prison Scrub is enabled
          if (isPrisonScrub) {
            try {
              const result = await validatePhone(phone, cache);
              const phonePrefix = numberOfPhones === 1 ? "Phone" : `Phone ${p}`;
              if (result.valid) {
                anyPhoneValid = true;
                // Store phone type and carrier for each phone number
                row[`${phonePrefix} Type`] = result.type || 'unknown';
                row[`${phonePrefix} Carrier`] = result.carrier || 'unknown';
                row[`${phonePrefix} Status`] = result.liveStatus || 'unknown';
                row[`${phonePrefix} Ported`] = result.isPorted ? 'Yes' : 'No';
                row[`${phonePrefix} Roaming`] = result.isRoaming ? 'Yes' : 'No';
              } else {
                row[`${phonePrefix} Type`] = 'invalid';
                row[`${phonePrefix} Carrier`] = 'N/A';
                row[`${phonePrefix} Status`] = result.liveStatus || 'INVALID';
                row[`${phonePrefix} Ported`] = 'N/A';
                row[`${phonePrefix} Roaming`] = 'N/A';
              }
            } catch (err) {
              // Error during validation
              const phonePrefix = numberOfPhones === 1 ? "Phone" : `Phone ${p}`;
              row[`${phonePrefix} Type`] = 'error';
              row[`${phonePrefix} Carrier`] = 'N/A';
              row[`${phonePrefix} Status`] = 'ERROR';
              row[`${phonePrefix} Ported`] = 'N/A';
              row[`${phonePrefix} Roaming`] = 'N/A';
            }
          } else {
            // Basic Scrub: just check if phone exists
            anyPhoneValid = true;
          }
        }
      }

      // Set row-level phone flags
      row["Missing Phone"] = !hasAnyPhone;
      row["Phone Valid"] = anyPhoneValid;

      // Validate all email fields
      let hasAnyEmail = false;
      let hasValidEmail = false;

      for (let e = 1; e <= numberOfEmails; e++) {
        const emailField = numberOfEmails === 1 ? "Email" : `Email ${e}`;
        const email = (row[emailField] as string)?.trim() || '';

        if (email) {
          hasAnyEmail = true;
          const emailResult = validateEmail(email);
          if (emailResult.valid) {
            hasValidEmail = true;
          }
        }
      }

      // Only mark as invalid if email exists but is invalid
      // If no email exists, it's valid (not invalid)
      row["Email Valid"] = !hasAnyEmail || hasValidEmail;

      // Update progress and add delay at regular intervals
      if (!isPrisonScrub) {
        // Basic Scrub: Update progress every N rows with delay for smooth animation
        if ((i + 1) % rowsPerStep === 0 || (i + 1) === totalRows) {
          const currentProgress = Math.round(((i + 1) / totalRows) * 100);
          setProgress(currentProgress);
          await new Promise(resolve => setTimeout(resolve, delayPerStep));
        }
      } else {
        // Prison Scrub: Update progress every row, yield periodically
        const currentProgress = Math.round(((i + 1) / totalRows) * 100);
        setProgress(currentProgress);
        if ((i + 1) % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    }

    setCleanedData(updatedRows);
    setIsValidating(false);
  };

  // Filter logic using new filter settings
  const filteredData = useMemo(() => {
    return applyDataFilters(cleanedData, filterSettings);
  }, [cleanedData, filterSettings]);

  const handleExport = () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `propscrub_cleaned_${timestamp}.csv`;
      exportToCSV(filteredData, filename, filterSettings.numberOfPhones, filterSettings.numberOfEmails, scrubVersion === 'prison');
    } catch (err) {
      setError(`Error exporting CSV: ${err}`);
    }
  };

  const handleExportToGHL = async () => {
    try {
      setIsExportingToGHL(true);
      setError('');

      const response = await fetch('/api/exportToGHL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contacts: filteredData,
          options: {
            defaultType: 'Seller',
            additionalTags: [filterSettings.marketSearch, new Date().toISOString().split('T')[0]].filter(Boolean)
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Export failed');
      }

      if (result.success) {
        alert(`Export complete!\n\nCreated: ${result.results.created}\nUpdated: ${result.results.updated}\nFailed: ${result.results.failed}`);
      }

    } catch (err) {
      setError(`Error exporting to GHL: ${err}`);
      alert(`Export failed: ${err}`);
    } finally {
      setIsExportingToGHL(false);
    }
  };

  const handleCleanAnother = () => {
    // Reset all state to start fresh
    setRawData([]);
    setCleanedData([]);
    setDetectedHeaders([]);
    setShowMarketSearchModal(false);
    setShowExportColumnsModal(false);
    setShowMappingModal(false);
    setError('');
    setProgress(0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <img
              src={assignsLogo}
              alt="PropScrub"
              className="header-logo clickable"
              onClick={handleCleanAnother}
              style={{ cursor: 'pointer' }}
              title="Return to home"
            />
            <div className="header-text">
              <span className="header-tagline">Clean, validate, and export lead data</span>
            </div>
          </div>
          <div className="header-right">
            <BalanceDisplay
              balance={userBalance}
              onPurchaseClick={() => setShowPurchaseModal(true)}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        {cleanedData.length === 0 && (
          <section className="version-section">
            <VersionToggle
              currentVersion={scrubVersion}
              onVersionChange={setScrubVersion}
            />
          </section>
        )}

        {!isValidating && cleanedData.length === 0 && (
          <FilterSettingsSection
            settings={filterSettings}
            onSettingsChange={setFilterSettings}
          />
        )}

        <section className="upload-section">
          <FileUpload
            onFileSelect={handleFileSelect}
            onClearFile={handleClearFile}
            disabled={isValidating}
          />
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showMarketSearchModal && (
          <MarketSearchModal
            initialValue={filterSettings.marketSearch}
            onClose={handleMarketSearchCancel}
            onContinue={handleMarketSearchContinue}
          />
        )}

        {showExportColumnsModal && (
          <ExportColumnsModal
            initialPhones={filterSettings.numberOfPhones}
            initialEmails={filterSettings.numberOfEmails}
            onClose={handleExportColumnsCancel}
            onMapCSV={handleExportColumnsMapCSV}
          />
        )}

        {showMappingModal && (
          <HeaderMappingModal
            detectedHeaders={detectedHeaders}
            numberOfPhones={filterSettings.numberOfPhones}
            numberOfEmails={filterSettings.numberOfEmails}
            onConfirm={handleMappingConfirm}
            onCancel={handleMappingCancel}
          />
        )}

        {showPurchaseModal && (
          <PurchaseModal
            onClose={() => setShowPurchaseModal(false)}
            onPurchase={handlePurchase}
          />
        )}

        {isValidating && (
          <LoadingScreen progress={progress} />
        )}

        {cleanedData.length > 0 && !isValidating && (
          <>
            <section className="stats-section">
              <div className="stats">
                <div className="stat">
                  <span className="stat-label">Total Rows:</span>
                  <span className="stat-value">{cleanedData.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Showing:</span>
                  <span className="stat-value">{filteredData.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Excluded:</span>
                  <span className="stat-value">{cleanedData.length - filteredData.length}</span>
                </div>
              </div>
            </section>

            <section className="top-export-section">
              <ExportButton
                onExport={handleExport}
                rowCount={filteredData.length}
              />
              <ExportToGHLButton
                onExport={handleExportToGHL}
                rowCount={filteredData.length}
                isExporting={isExportingToGHL}
              />
              <button onClick={handleCleanAnother} className="clean-another-button">
                <span>Clean New List</span>
              </button>
            </section>

            <section className="table-section">
              <DataTable
                data={filteredData}
                numberOfPhones={filterSettings.numberOfPhones}
                numberOfEmails={filterSettings.numberOfEmails}
                isPrisonScrub={scrubVersion === 'prison'}
              />
            </section>

            <section className="export-section">
              <ExportButton
                onExport={handleExport}
                rowCount={filteredData.length}
              />
              <ExportToGHLButton
                onExport={handleExportToGHL}
                rowCount={filteredData.length}
                isExporting={isExportingToGHL}
              />
              <button onClick={handleCleanAnother} className="clean-another-button">
                <span>Clean Another List</span>
              </button>
            </section>
          </>
        )}
      </main>

    </div>
  );
}

export default App;
