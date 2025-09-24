# Clear Browser Cache Instructions

## For Chrome/Edge:
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "All time" as the time range
3. Check all boxes (Browsing history, Cookies, Cached images and files, etc.)
4. Click "Clear data"

## For Firefox:
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "Everything" as the time range
3. Check all boxes
4. Click "Clear Now"

## Alternative Method (Hard Refresh):
- Press `Ctrl + F5` (or `Cmd + Shift + R` on Mac)
- This forces a hard refresh and clears cached resources

## After clearing cache:
1. Navigate to `http://localhost:3000/dashboard/email/templates-test`
2. The ChunkLoadError should be resolved
3. The page should load properly without any chunk loading issues
