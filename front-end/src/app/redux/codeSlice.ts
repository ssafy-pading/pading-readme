import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface CodeState {
  code: string;
  fileName: string;
  review: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface CodeReviewResponse {
  review: string;
}

const initialState: CodeState = {
  code: '',
  fileName: '',
  review: '',
  status: 'idle',
  error: null,
};

export const fetchCodeReview = createAsyncThunk<
  CodeReviewResponse,
  string,
  { rejectValue: string }
>(
  'code/fetchCodeReview',
  async (code, thunkAPI) => {
    try {
      const response = await fetch('http://localhost:8080/api/chatgpt-review', { // ✅ 백엔드 서버로 요청
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `
You are an expert code reviewer with deep knowledge of JavaScript and modern development best practices. Please analyze the following code and provide **detailed feedback** and **specific suggestions for improvement**.

Your review should cover the following aspects:

1. **Typographical Errors & Syntax Issues** *(Mandatory)*
   - Identify and correct any typos, syntax errors, or inconsistencies in variable/function names.
   - If there are any errors, return the corrected code within a code block (\`\`\`js ... \`\`\`).

2. **Code Quality & Best Practices**
   - Evaluate readability, maintainability, and adherence to best practices.
   - Identify performance bottlenecks and suggest optimizations.
   - Highlight any potential security risks (e.g., XSS, injection vulnerabilities).
   - Point out logical flaws or edge cases that may cause unexpected behavior.

Provide a structured review with **examples of suggested improvements** and **explanations for each recommendation**.

🔹 **All responses must be written in Korean.**
🔹 **If there are typographical errors or syntax issues, return the corrected version inside a JavaScript code block (\`\`\`js ... \`\`\`).**
🔹 **Please provide your review in a structured format, using clear and professional Korean language.**
`,
            },
            {
              role: 'user',
              content: code,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        return thunkAPI.rejectWithValue('ChatGPT API 요청에 실패하였습니다.');
      }

      const data = await response.json();
      const review = data.review; // ✅ 서버에서 반환된 review 사용
      if (!review) {
        return thunkAPI.rejectWithValue('리뷰 결과를 가져오지 못했습니다.');
      }
      return { review };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


const codeSlice = createSlice({
  name: 'code',
  initialState,
  reducers: {
    // 모나코 에디터에서 받아온 코드를 저장합니다.
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    // 파일 이름을 저장하는 액션
    setFileName: (state, action: PayloadAction<string>) => {
      state.fileName = action.payload;
    },
    // 리뷰 결과를 초기화하는 액션
    clearReview: (state) => {
      state.review = '';
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCodeReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCodeReview.fulfilled, (state, action: PayloadAction<CodeReviewResponse>) => {
        state.status = 'succeeded';
        state.review = action.payload.review;
      })
      .addCase(fetchCodeReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { setCode, setFileName, clearReview } = codeSlice.actions;
export default codeSlice.reducer;
