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
      const placement = btn.dataset.placement || "top";
      tooltip.textContent = text;
      tooltip.classList.add("show");

      // Lấy vị trí của nút so với viewport
      const rect = btn.getBoundingClientRect();
      const btnTopViewport = rect.top;
      const btnLeftViewport = rect.left;
      const btnWidth = rect.width;
      const btnHeight = rect.height;

      // Kích thước tooltip
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      // Tính vị trí mong muốn
      let topViewport = 0;
      let leftViewport = 0;

      switch (placement) {
        case "top":
          topViewport = btnTopViewport - tooltipHeight - 8;
          leftViewport = btnLeftViewport + btnWidth / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          topViewport = btnTopViewport + btnHeight + 8;
          leftViewport = btnLeftViewport + btnWidth / 2 - tooltipWidth / 2;
          break;
        case "left":
          topViewport = btnTopViewport + btnHeight / 2 - tooltipHeight / 2;
          leftViewport = btnLeftViewport - tooltipWidth - 8;
          break;
        case "right":
          topViewport = btnTopViewport + btnHeight / 2 - tooltipHeight / 2;
          leftViewport = btnLeftViewport + btnWidth + 8;
          break;
        default:
          topViewport = btnTopViewport - tooltipHeight - 8;
          leftViewport = btnLeftViewport + btnWidth / 2 - tooltipWidth / 2;
      }

      //Tính vị trí tooltip không để tràn màn hình
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const PADDING = 4;

      if (leftViewport < PADDING) leftViewport = PADDING;
      if (leftViewport + tooltipWidth > viewportWidth - PADDING)
        leftViewport = viewportWidth - tooltipWidth - PADDING;
      if (topViewport < PADDING) topViewport = PADDING;
      if (topViewport + tooltipHeight > viewportHeight - PADDING)
        topViewport = viewportHeight - tooltipHeight - PADDING;

      // Tính vị trí tooltip khi áp dụng scrollbar
      const topDocument = topViewport + window.scrollY;
      const leftDocument = leftViewport + window.scrollX;

      tooltip.style.top = `${topDocument}px`;
      tooltip.style.left = `${leftDocument}px`;
    });

    btn.addEventListener("mouseleave", () => {
      tooltip.classList.remove("show");
    });
  });
}
