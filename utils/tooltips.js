export function initTooltip(selector) {
  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }

  const buttons = document.querySelectorAll(selector);
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      const text = btn.dataset.tooltip;
      // Xóa tất cả các lớp vị trí cũ
      tooltip.className = "tooltip";

      const placement = btn.dataset.placement || "top";
      tooltip.textContent = text;
      tooltip.classList.add("show");
      tooltip.classList.add(placement);

      // Đợi trình duyệt render tooltip xong để lấy kích thước
      requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();

        const tooltipWidth = Math.round(tooltip.offsetWidth);
        const tooltipHeight = Math.round(tooltip.offsetHeight);
        const btnTopViewport = Math.round(rect.top);
        const btnLeftViewport = Math.round(rect.left);
        const btnWidth = Math.round(rect.width);
        const btnHeight = Math.round(rect.height);

        let topViewport = 0;
        let leftViewport = 0;
        const OFFSET_SPACING = 8;

        switch (placement) {
          case "top":
          case "bottom":
            const ICON_AREA_WIDTH = 50;
            leftViewport =
              btnLeftViewport + ICON_AREA_WIDTH / 2 - tooltipWidth / 2;

            topViewport =
              placement === "top"
                ? btnTopViewport - tooltipHeight - OFFSET_SPACING
                : btnTopViewport + btnHeight + OFFSET_SPACING;
            break;
          case "left":
          case "right":
            topViewport = btnTopViewport + btnHeight / 2 - tooltipHeight / 2;

            leftViewport =
              placement === "left"
                ? btnLeftViewport - tooltipWidth - OFFSET_SPACING
                : btnLeftViewport + btnWidth + OFFSET_SPACING;
            break;
        }

        // --- Xử lý va chạm với Viewport ---
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const PADDING = 4;

        // Điều chỉnh vị trí ngang
        if (leftViewport < PADDING) leftViewport = PADDING;
        if (leftViewport + tooltipWidth > viewportWidth - PADDING)
          leftViewport = viewportWidth - tooltipWidth - PADDING;

        // Điều chỉnh vị trí dọc
        if (topViewport < PADDING) topViewport = PADDING;
        if (topViewport + tooltipHeight > viewportHeight - PADDING)
          topViewport = viewportHeight - tooltipHeight - PADDING;

        // Áp dụng vị trí (Cộng thêm scroll để định vị tuyệt đối so với tài liệu)
        tooltip.style.top = `${topViewport + window.scrollY}px`;
        tooltip.style.left = `${leftViewport + window.scrollX}px`;
      });
    });
    btn.addEventListener("mouseleave", () => {
      tooltip.classList.remove("show");
    });
  });
}
