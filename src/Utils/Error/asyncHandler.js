// دالة asyncHandler عشان نلغي تكرار try/catch في كل Controller
// بتاخد الـ async function وتعمل catch لأي إيرور وتبعت الـ next(err) تلقائياً
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
